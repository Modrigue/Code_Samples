using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace CodeSamples.CSharp
{
    /// <summary>
    /// Provides helper methods for controlling the rendering of Windows Forms controls.
    /// </summary>
    public static class ControlRenderHelper
    {
        #region Redraw functions
		
        [DllImport("user32.dll", EntryPoint = "SendMessageA", ExactSpelling = true, CharSet = CharSet.Ansi, SetLastError = true)]
        private static extern int SendMessage(IntPtr hwnd, int wMsg, int wParam, int lParam);
        private const int WM_SETREDRAW = 0xB;

        /// <summary>
        /// Suspends the drawing of the specified control to prevent flickering during updates.
        /// </summary>
        /// <param name="target">The control for which to suspend drawing.</param>
        public static void SuspendDrawing(this Control target)
        {
            SendMessage(target.Handle, WM_SETREDRAW, 0, 0);
        }

        /// <summary>
        /// Resumes the drawing of the specified control and optionally refreshes it.
        /// </summary>
        /// <param name="target">The control for which to resume drawing.</param>
        public static void ResumeDrawing(this Control target) { ResumeDrawing(target, true); }
        
        /// <summary>
        /// Resumes the drawing of the specified control with an option to refresh it.
        /// </summary>
        /// <param name="target">The control for which to resume drawing.</param>
        /// <param name="redraw">True to refresh the control after resuming drawing; otherwise, false.</param>
        public static void ResumeDrawing(this Control target, bool redraw)
        {
            SendMessage(target.Handle, WM_SETREDRAW, 1, 0);

            if (redraw)
            {
                target.Refresh();
            }
        }
		
        #endregion
    }
}
