using System;

namespace CodeSamples.CSharp
{
    public static class UnixTime
    {
        private static readonly DateTime Jan1st1970 = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        /// <summary>
		/// Get extra long current timestamp
		/// </summary>
        public static long Milliseconds
        {
            get { return (long)((DateTime.UtcNow - Jan1st1970).TotalMilliseconds); }
        }

        /// <summary>
		/// Get current date from timestamp
		/// </summary>
        public static DateTime CurrentTimeFromSeconds(long seconds)
        {
            return Jan1st1970.AddSeconds(seconds);
        }
    }
}
