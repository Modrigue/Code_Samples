using System;
using System.Diagnostics;
using System.IO;
using System.Net;

namespace CodeSamples.CSharp
{
    /// <summary>
    /// Provides static methods for logging messages and exceptions to log files.
    /// </summary>
    public static class Logger
    {
        /// <summary>
        /// Initializes the logger with a specific name and logs the initialization.
        /// </summary>
        /// <param name="name">The name to be used for the log file.</param>
        public static void Initialize(string name)
        {
            string logPath = getLogPath(name);
            WriteLineTrace(name, "Logger initialized");
        }

        /// <summary>
        /// Writes a message to the log file without a timestamp.
        /// </summary>
        /// <param name="name">The name of the log file.</param>
        /// <param name="message">The message to be logged.</param>
        /// <exception cref="System.ArgumentNullException">Thrown when either name or message is null.</exception>
        /// <exception cref="System.IO.IOException">Thrown when an I/O error occurs while writing to the log file.</exception>
        public static void WriteLine(string name, string message)
        {
            File.AppendAllText(getLogPath(name), message + Environment.NewLine);
        }

        /// <summary>
        /// Writes a message to the log file with a UTC timestamp.
        /// </summary>
        /// <param name="name">The name of the log file.</param>
        /// <param name="message">The message to be logged.</param>
        /// <exception cref="System.ArgumentNullException">Thrown when either name or message is null.</exception>
        /// <exception cref="System.IO.IOException">Thrown when an I/O error occurs while writing to the log file.</exception>
        public static void WriteLineTrace(string name, string message)
        {           
            File.AppendAllText(getLogPath(name), DateTime.UtcNow + " " + message + Environment.NewLine);
        }

        /// <summary>
        /// Writes an error message to the log file with a UTC timestamp and ERROR prefix.
        /// </summary>
        /// <param name="name">The name of the log file.</param>
        /// <param name="message">The error message to be logged.</param>
        /// <exception cref="System.ArgumentNullException">Thrown when either name or message is null.</exception>
        /// <exception cref="System.IO.IOException">Thrown when an I/O error occurs while writing to the log file.</exception>
        public static void WriteLineException(string name, string message)
        {
            File.AppendAllText(getLogPath(name), DateTime.UtcNow + " ERROR " + message + Environment.NewLine);
        }

        /// <summary>
        /// Writes a WebException and its details to the log file with a UTC timestamp.
        /// </summary>
        /// <param name="name">The name of the log file.</param>
        /// <param name="ex">The WebException to be logged.</param>
        /// <exception cref="System.ArgumentNullException">Thrown when name is null.</exception>
        /// <exception cref="System.IO.IOException">Thrown when an I/O error occurs while writing to the log file.</exception>
        public static void WriteLineException(string name, WebException ex)
        {
            string info = (ex.Response != null) ?
                new StreamReader(ex.Response.GetResponseStream()).ReadToEnd() :
                "";

            File.AppendAllText(getLogPath(name), DateTime.UtcNow + " ERROR " + ex.Message + ", " + info + Environment.NewLine);
            File.AppendAllText(getLogPath(name), ex.StackTrace + Environment.NewLine);
        }

        /// <summary>
        /// Writes a general Exception and its stack trace to the log file with a UTC timestamp.
        /// </summary>
        /// <param name="name">The name of the log file.</param>
        /// <param name="ex">The Exception to be logged.</param>
        /// <exception cref="System.ArgumentNullException">Thrown when either name or ex is null.</exception>
        /// <exception cref="System.IO.IOException">Thrown when an I/O error occurs while writing to the log file.</exception>
        public static void WriteLineException(string name, Exception ex)
        {
            File.AppendAllText(getLogPath(name), DateTime.UtcNow + " ERROR " + ex.Message + Environment.NewLine);
            File.AppendAllText(getLogPath(name), ex.StackTrace + Environment.NewLine);
        }

        /// <summary>
        /// Generates a log file path based on the provided name and current date.
        /// Creates the log file if it doesn't exist.
        /// </summary>
        /// <param name="name">The name to be used in the log file name.</param>
        /// <returns>The full path to the log file.</returns>
        /// <exception cref="System.ArgumentNullException">Thrown when name is null.</exception>
        /// <exception cref="System.IO.IOException">Thrown when an I/O error occurs while creating the log file.</exception>
        private static string getLogPath(string name)
        {
            string logPath = "log_" + name + "_" + DateTime.Now.ToString("yyyy-MM-dd") + ".log";

            if (!File.Exists(logPath))
                File.Create(logPath).Close();

            return logPath;
        }
	}
}
