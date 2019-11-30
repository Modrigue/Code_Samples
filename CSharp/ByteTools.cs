using System;
using System.Drawing;
using System.IO;
using System.Linq;

namespace CodeSamples.CSharp
{
    public class ByteTools
    {
        /// <summary>
        /// Clones byte array
        /// </summary>
        public static byte[] Clone(byte[] array)
        {
            byte[] res = new byte[array.Length];
            Buffer.BlockCopy(array, 0, res, 0, array.Length);

            return res;
        }

        /// <summary>
        /// Concatenates 2 byte arrays
        /// </summary>
        public static byte[] Concatenate(byte[] array1, byte[] array2)
        {
            // handle null cases

            if (array1 == null && array2 == null)
                return null;

            if (array1 == null)
                return Clone(array2);

            if (array2 == null)
               return Clone(array1);

            // concatenate the 2 arrays
            byte[] res = new byte[array1.Length + array2.Length];
            Buffer.BlockCopy(array1, 0, res, 0, array1.Length);
            Buffer.BlockCopy(array2, 0, res, array1.Length, array2.Length);

            return res;
        }

        /// <summary>
        /// Concatenates 3 byte arrays
        /// </summary>
        public static byte[] Concatenate(byte[] array1, byte[] array2, byte[] array3)
        {
            // handle null cases

            if (array1 == null && array2 == null && array3 == null)
                return null;

            if (array1 == null && array2 == null)
                return Clone(array3);

            if (array1 == null && array3 == null)
                return Clone(array2);

            if (array2 == null && array3 == null)
                return Clone(array1);

            if (array1 == null)
                return Concatenate(array2, array3);

            if (array2 == null)
                return Concatenate(array1, array3);

            if (array3 == null)
                return Concatenate(array1, array2);

            // concatenates the 3 arrays
            byte[] res = new byte[array1.Length + array2.Length + array3.Length];
            Buffer.BlockCopy(array1, 0, res, 0, array1.Length);
            Buffer.BlockCopy(array2, 0, res, array1.Length, array2.Length);
            Buffer.BlockCopy(array3, 0, res, array1.Length + array2.Length, array3.Length);

            return res;
        }

        /// <summary>
        /// Concatenates n byte arrays
        /// </summary>
        public static byte[] Concatenate(params byte[][] arrays)
        {
            byte[] res = new byte[arrays.Where(x => x != null).Sum(x => x.Length)];

            int offset = 0;
            foreach (byte[] array in arrays)
            {
                // skip if null
                if (array == null)
                    continue;

                Buffer.BlockCopy(array, 0, res, offset, array.Length);
                offset += array.Length;
            }

            return res;
        }

        /// <summary>
        /// Converts an int to a byte array
        /// </summary>
        public static byte[] ConvertIntToBytes(int n, bool littleEndian = true)
        {
            byte[] bytes = BitConverter.GetBytes((ushort)n);

            if (littleEndian)
                Array.Reverse(bytes, 0, bytes.Length);

            return bytes;
        }

        /// <summary>
        /// Converts a big int to a byte array
        /// </summary>
        public static byte[] ConvertBigIntToBytes(int n, bool littleEndian = true)
        {
            byte[] bytes = BitConverter.GetBytes(n);

            if (littleEndian)
                Array.Reverse(bytes, 0, bytes.Length);

            return bytes;
        }

        /// <summary>
        /// Converts a byte array to an int
        /// </summary>
        public static int ConvertBytesToInt(byte[] array, bool littleEndian = true)
        {
            if (array == null)
                return 0;

            byte[] bytes = new byte[array.Length];
            array.CopyTo(bytes, 0);

            if (littleEndian)
                Array.Reverse(bytes, 0, bytes.Length);

            int res = 0;
            switch (bytes.Length)
            {
                case 1:
                    res = (int)bytes[0];
                    break;
                case 2:
                    res = BitConverter.ToInt16(bytes, 0);
                    break;
                case 4:
                    res = BitConverter.ToInt32(bytes, 0);
                    break;
                default:
                    throw new Exception("Size " + bytes.Length + " not handled conversion to int.");
            }

            return res;
        }

        /// <summary>
        /// Converts a byte array to an image
        /// </summary>
        public static Image ConvertBytesToImage(byte[] array)
        {
            try
            {
                using (var ms = new MemoryStream(array))
                {
                    return Image.FromStream(ms);
                }
            }
            catch { }

            return null;
        }

        /// <summary>
        /// Converts an image to a byte array
        /// </summary>
        public static byte[] ConvertImageToBytes(Image image)
        {
            using (var ms = new MemoryStream())
            {
                image.Save(ms, image.RawFormat);
                return ms.ToArray();
            }
        }

        public static byte[] CopyRange(byte[] src, int offset)
        {
            int length = src.Length - offset;
            byte[] dest = new byte[length];

            // NOTE: i always starts from 0
            for (int i = 0; i < length; i++)
            {
                dest[i] = src[offset + i]; // 0..n = 0+x..n+x
            }
            return dest;
        }

        public static byte[] CopyRange(byte[] src, int start, int end)
        {
            int length = end - start;
            byte[] dest = new byte[length];

            // NOTE: i always starts from 0
            for (int i = 0; i < length; i++)
            {
                dest[i] = src[start + i]; // 0..n = 0+x..n+x
            }
            return dest;
        }

        public static int UnsignedToByte(byte b)
        {
            return ((int)b) & 0xFF;
        }


        /// <summary>
        /// Returns true iff. the arrays are strictly equal, false otherwise
        /// </summary>
        public static bool AreEqual(byte[] array1, byte[] array2)
        {
            // handle null cases
            if (array1 == null && array2 == null)
                return true;
            if (array1 == null || array2 == null)
                return false;

            // check length
            if (array1.Length != array2.Length)
                return false;

            // byte-per-byte comparison
            for (int i = 0; i < array1.Length; i++)
                if (array1[i] != array2[i])
                    return false;

            return true;
        }

        public static string ConvertByteArrayToString(byte[] array)
        {
            if (array == null)
                return null;

            string res = "";

            int index = 0;
            while (index < array.Length)
            {
                int a = (int)array[index];
                res += (char)a;
                index++;
            }

            return res;
        }

        public static byte[] ConvertStringToByteArray(string text)
        {
            if (String.IsNullOrEmpty(text))
                return null;

            int length = text.Length;
            byte[] array = new byte[length];

            int index = 0;
            while (index < length)
            {
                char a = text[index];
                array[index] = (byte)a;
                index++;
            }

            return array;
        }

        public static byte[] TrimEndByteArray(byte[] array, bool addLastZero = false)
        {
            int lastZeroIndex = Array.FindLastIndex(array, b => b != 0);

            if (lastZeroIndex >= array.Length - 1)
                addLastZero = false;

            if (addLastZero)
                Array.Resize(ref array, lastZeroIndex + 2); // include last zero
            else
                Array.Resize(ref array, lastZeroIndex + 1);

            return array;
        }

        public static byte[] TrimByteArrayToIndex(byte[] array, int index)
        {
            Array.Resize(ref array, index);

            return array;
        }
    }
}
