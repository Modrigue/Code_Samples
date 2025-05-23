using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

//
// Taken from:
// https://www.codeproject.com/Articles/17561/Programmatically-adding-attachments-to-emails-in-C
//

namespace CodeSamples.CSharp
{
    /// <summary>
    /// Provides functionality to create and send emails with attachments using MAPI.
    /// </summary>
    public class MailWriter
    {
        #region Public methods

        /// <summary>
        /// Adds a recipient to the email's To field.
        /// </summary>
        /// <param name="email">The email address of the recipient to add.</param>
        /// <returns>True if the recipient was added successfully; otherwise, false.</returns>
        public bool AddRecipientTo(string email)
        {
            return AddRecipient(email, HowTo.MAPI_TO);
        }

        /// <summary>
        /// Adds a recipient to the email's CC field.
        /// </summary>
        /// <param name="email">The email address of the CC recipient to add.</param>
        /// <returns>True if the recipient was added successfully; otherwise, false.</returns>
        public bool AddRecipientCC(string email)
        {
            return AddRecipient(email, HowTo.MAPI_CC);
        }

        /// <summary>
        /// Adds a recipient to the email's BCC field.
        /// </summary>
        /// <param name="email">The email address of the BCC recipient to add.</param>
        /// <returns>True if the recipient was added successfully; otherwise, false.</returns>
        public bool AddRecipientBCC(string email)
        {
            return AddRecipient(email, HowTo.MAPI_BCC);
        }

        /// <summary>
        /// Adds a file attachment to the email.
        /// </summary>
        /// <param name="strAttachmentFileName">The full path to the file to be attached.</param>
        public void AddAttachment(string strAttachmentFileName)
        {
            if (!String.IsNullOrEmpty(strAttachmentFileName))
                m_attachments.Add(strAttachmentFileName);
        }

        /// <summary>
        /// Sends the email with a popup dialog for the user to review before sending.
        /// </summary>
        /// <param name="strSubject">The subject of the email.</param>
        /// <param name="strBody">The body text of the email.</param>
        /// <returns>An integer representing the result of the MAPI send operation.</returns>
        public int SendMailPopup(string strSubject, string strBody)
        {
            return SendMail(strSubject, strBody, MAPI_LOGON_UI | MAPI_DIALOG);
        }

        /// <summary>
        /// Sends the email directly without showing a popup dialog.
        /// </summary>
        /// <param name="strSubject">The subject of the email.</param>
        /// <param name="strBody">The body text of the email.</param>
        /// <returns>An integer representing the result of the MAPI send operation.</returns>
        public int SendMailDirect(string strSubject, string strBody)
        {
            return SendMail(strSubject, strBody, MAPI_LOGON_UI);
        }

        #endregion

        #region Private methods

        [DllImport("MAPI32.DLL")]
        static extern int MAPISendMail(IntPtr sess, IntPtr hwnd, MapiMessage message, int flg, int rsv);

        /// <summary>
        /// Internal method to send the email using MAPI.
        /// </summary>
        /// <param name="strSubject">The subject of the email.</param>
        /// <param name="strBody">The body text of the email.</param>
        /// <param name="how">Flags controlling how the email is sent (e.g., MAPI_LOGON_UI).</param>
        /// <returns>An integer representing the result of the MAPI send operation.</returns>
        private int SendMail(string strSubject, string strBody, int how)
        {
            MapiMessage msg = new MapiMessage();
            msg.subject = strSubject;
            msg.noteText = strBody;

            msg.recips = GetRecipients(out msg.recipCount);
            msg.files = GetAttachments(out msg.fileCount);

            m_lastError = MAPISendMail(new IntPtr(0), new IntPtr(0), msg, how, 0);
            if (m_lastError > 1)
                Console.WriteLine("MAPISendMail failed! " + GetLastError(), "MAPISendMail");

            Cleanup(ref msg);
            return m_lastError;
        }

        /// <summary>
        /// Adds a recipient with the specified type (To, CC, BCC).
        /// </summary>
        /// <param name="email">The email address of the recipient.</param>
        /// <param name="howTo">The type of recipient (To, CC, or BCC).</param>
        /// <returns>True if the recipient was added successfully; otherwise, false.</returns>
        private bool AddRecipient(string email, HowTo howTo)
        {
            MapiRecipDesc recipient = new MapiRecipDesc();

            recipient.recipClass = (int)howTo;
            recipient.name = email;
            m_recipients.Add(recipient);

            return true;
        }

        /// <summary>
        /// Gets an array of MAPI recipient structures for all recipients.
        /// </summary>
        /// <param name="recipCount">The number of recipients added.</param>
        /// <returns>An IntPtr to the array of MAPI recipient structures.</returns>
        private IntPtr GetRecipients(out int recipCount)
        {
            recipCount = 0;
            if (m_recipients.Count == 0)
                return IntPtr.Zero;

            int size = Marshal.SizeOf(typeof(MapiRecipDesc));
            IntPtr intPtr = Marshal.AllocHGlobal(m_recipients.Count * size);

            // 64-bit
            if (Environment.Is64BitOperatingSystem)
            {
                Int64 ptr = (Int64)intPtr;
                foreach (MapiRecipDesc mapiDesc in m_recipients)
                {
                    Marshal.StructureToPtr(mapiDesc, (IntPtr)ptr, false);
                    ptr += size;
                }
            }
            // 32-bit
            else
            {
                Int32 ptr = (Int32)intPtr;
                foreach (MapiRecipDesc mapiDesc in m_recipients)
                {
                    Marshal.StructureToPtr(mapiDesc, (IntPtr)ptr, false);
                    ptr += size;
                }
            }

            recipCount = m_recipients.Count;
            return intPtr;
        }

        /// <summary>
        /// Gets an array of MAPI file attachment structures for all attachments.
        /// </summary>
        /// <param name="fileCount">The number of files added as attachments.</param>
        /// <returns>An IntPtr to the array of MAPI file attachment structures.</returns>
        private IntPtr GetAttachments(out int fileCount)
        {
            fileCount = 0;
            if (m_attachments == null)
                return IntPtr.Zero;

            if ((m_attachments.Count <= 0) || (m_attachments.Count > maxAttachments))
                return IntPtr.Zero;

            int size = Marshal.SizeOf(typeof(MapiFileDesc));
            IntPtr intPtr = Marshal.AllocHGlobal(m_attachments.Count * size);

            MapiFileDesc mapiFileDesc = new MapiFileDesc();
            mapiFileDesc.position = -1;

            // 64-bit
            if (Environment.Is64BitOperatingSystem)
            {
                Int64 ptr = (Int64)intPtr;
                foreach (string strAttachment in m_attachments)
                {
                    mapiFileDesc.name = Path.GetFileName(strAttachment);
                    mapiFileDesc.path = strAttachment;
                    Marshal.StructureToPtr(mapiFileDesc, (IntPtr)ptr, false);
                    ptr += size;
                }
            }
            // 32-bit
            else
            {
                Int32 ptr = (Int32)intPtr;
                foreach (string strAttachment in m_attachments)
                {
                    mapiFileDesc.name = Path.GetFileName(strAttachment);
                    mapiFileDesc.path = strAttachment;
                    Marshal.StructureToPtr(mapiFileDesc, (IntPtr)ptr, false);
                    ptr += size;
                }
            }

            fileCount = m_attachments.Count;
            return intPtr;
        }

        /// <summary>
        /// Cleans up allocated resources for the MAPI message.
        /// </summary>
        /// <param name="msg">The MAPI message structure to clean up.</param>
        private void Cleanup(ref MapiMessage msg)
        {
            int size = Marshal.SizeOf(typeof(MapiRecipDesc));

            // 64-bit
            if (Environment.Is64BitOperatingSystem)
            {
                Int64 ptr = 0;

                if (msg.recips != IntPtr.Zero)
                {
                    ptr = (Int64)msg.recips;
                    for (int i = 0; i < msg.recipCount; i++)
                    {
                        Marshal.DestroyStructure((IntPtr)ptr, typeof(MapiRecipDesc));
                        ptr += size;
                    }
                    Marshal.FreeHGlobal(msg.recips);
                }

                if (msg.files != IntPtr.Zero)
                {
                    size = Marshal.SizeOf(typeof(MapiFileDesc));

                    ptr = (Int64)msg.files;
                    for (int i = 0; i < msg.fileCount; i++)
                    {
                        Marshal.DestroyStructure((IntPtr)ptr, typeof(MapiFileDesc));
                        ptr += size;
                    }
                    Marshal.FreeHGlobal(msg.files);
                }
            }
            // 32-bit
            else
            {
                Int32 ptr = 0;

                if (msg.recips != IntPtr.Zero)
                {
                    ptr = (Int32)msg.recips;
                    for (int i = 0; i < msg.recipCount; i++)
                    {
                        Marshal.DestroyStructure((IntPtr)ptr, typeof(MapiRecipDesc));
                        ptr += size;
                    }
                    Marshal.FreeHGlobal(msg.recips);
                }

                if (msg.files != IntPtr.Zero)
                {
                    size = Marshal.SizeOf(typeof(MapiFileDesc));

                    ptr = (Int32)msg.files;
                    for (int i = 0; i < msg.fileCount; i++)
                    {
                        Marshal.DestroyStructure((IntPtr)ptr, typeof(MapiFileDesc));
                        ptr += size;
                    }
                    Marshal.FreeHGlobal(msg.files);
                }

            }

            m_recipients.Clear();
            m_attachments.Clear();
            m_lastError = 0;
        }

        public string GetLastError()
        {
            if (m_lastError <= 26)
                return errors[m_lastError];
            return "MAPI error [" + m_lastError.ToString() + "]";
        }

        readonly string[] errors = new string[] {
        "OK [0]", "User abort [1]", "General MAPI failure [2]", "MAPI login failure [3]",
        "Disk full [4]", "Insufficient memory [5]", "Access denied [6]", "-unknown- [7]",
        "Too many sessions [8]", "Too many files were specified [9]", "Too many recipients were specified [10]", "A specified attachment was not found [11]",
        "Attachment open failure [12]", "Attachment write failure [13]", "Unknown recipient [14]", "Bad recipient type [15]",
        "No messages [16]", "Invalid message [17]", "Text too large [18]", "Invalid session [19]",
        "Type not supported [20]", "A recipient was specified ambiguously [21]", "Message in use [22]", "Network failure [23]",
        "Invalid edit fields [24]", "Invalid recipients [25]", "Not supported [26]"
        };


        List<MapiRecipDesc> m_recipients = new List<MapiRecipDesc>();
        List<string> m_attachments = new List<string>();
        int m_lastError = 0;

        const int MAPI_LOGON_UI = 0x00000001;
        const int MAPI_DIALOG = 0x00000008;
        const int maxAttachments = 20;

        enum HowTo { MAPI_ORIG = 0, MAPI_TO, MAPI_CC, MAPI_BCC };

        #endregion
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    class MapiMessage
    {
        public int reserved;
        public string subject;
        public string noteText;
        public string messageType;
        public string dateReceived;
        public string conversationID;
        public int flags;
        public IntPtr originator;
        public int recipCount;
        public IntPtr recips;
        public int fileCount;
        public IntPtr files;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    class MapiFileDesc
    {
        public int reserved;
        public int flags;
        public int position;
        public string path;
        public string name;
        public IntPtr type;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    class MapiRecipDesc
    {
        public int reserved;
        public int recipClass;
        public string name;
        public string address;
        public int eIDSize;
        public IntPtr entryID;
    }
}
