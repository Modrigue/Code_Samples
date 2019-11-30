using System;
using System.Diagnostics;
using System.IO;
using System.Net;

namespace CodeSamples.CSharp
{
    public static class Logger
    {
        public static void Initialize(string name)
        {
            string logPath = getLogPath(name);

            WriteLineTrace(name, "Logger initialized");
        }

        /// <summary>
        /// Writes a message in the Trace appender
        /// </summary>
        /// <param name="message">Message to log</param>
        public static void WriteLine(string name, string message)
        {
            File.AppendAllText(getLogPath(name), message + Environment.NewLine);
        }

        /// <summary>
        /// Writes a message in the Trace appender
        /// </summary>
        /// <param name="message">Message to log</param>
        public static void WriteLineTrace(string name, string message)
        {           
            File.AppendAllText(getLogPath(name), DateTime.UtcNow + " " + message + Environment.NewLine);
        }

		/// <summary>
		/// Writes a message in the Trace appender
		/// </summary>
		/// <param name="message">Message to log</param>
		public static void WriteLineException(string name, string message)
		{
            File.AppendAllText(getLogPath(name), DateTime.UtcNow + " ERROR " + message + Environment.NewLine);
        }

        /// <summary>
		/// Writes a message in the Trace appender
		/// </summary>
		/// <param name="ex">Exception</param>
		public static void WriteLineException(string name, WebException ex)
        {
            string info = (ex.Response != null) ?
                new StreamReader(ex.Response.GetResponseStream()).ReadToEnd() :
            "";

            File.AppendAllText(getLogPath(name), DateTime.UtcNow + " ERROR " + ex.Message + ", " + info + Environment.NewLine);
            File.AppendAllText(getLogPath(name), ex.StackTrace + Environment.NewLine);
        }

        /// <summary>
        /// Writes a message in the Trace appender
        /// </summary>
        /// <param name="ex">Exception</param>
        public static void WriteLineException(string name, Exception ex)
		{
            File.AppendAllText(getLogPath(name), DateTime.UtcNow + " ERROR " + ex.Message + Environment.NewLine);
            File.AppendAllText(getLogPath(name), ex.StackTrace + Environment.NewLine);
        }

        private static string getLogPath(string name)
        {
            string logPath = "log_" + name + "_" + DateTime.Now.ToString("yyyy-MM-dd") + ".log";

            if (!File.Exists(logPath))
                File.Create(logPath).Close();

            return logPath;
        }
	}
}
