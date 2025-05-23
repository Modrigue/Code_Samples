using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace CodeSamples.CSharp
{
    /// <summary>
    /// Provides utility methods for generating random values and strings.
    /// </summary>
    public class RandomGenerationTools
    {
        private static readonly Random random_ = new Random();

        /// <summary>
        /// Generates a random byte array of the specified size.
        /// </summary>
        /// <param name="size">The length of the byte array to generate.</param>
        /// <returns>A random byte array of the specified length.</returns>
        public static byte[] GenerateRandomBytes(int size)
        {
            byte[] bytes = new byte[size];
            for (int i = 0; i < size; i++)
                bytes[i] = (byte)(random_.Next(0, 255));

            return bytes;
        }

        /// <summary>
        /// Generates a random integer within a specified range.
        /// </summary>
        /// <param name="length">The number of digits in the random number.</param>
        /// <returns>A 32-bit signed integer greater than or equal to 0 and less than 10^length.</returns>
        public static int RandomInt(int length)
        {
            int num = random_.Next(0, (int)Math.Round(Math.Pow(10, length)));
            return num;
        }

        /// <summary>
        /// Generates a random hexadecimal string of the specified size.
        /// </summary>
        /// <param name="length">The length of the hexadecimal string to generate.</param>
        /// <returns>A random hexadecimal string of the specified length.</returns>
        private static string randomHexString(int length)
        {
            // 64 character precision or 256-bits
            string hexValue = string.Empty;
            int num;

            for (int i = 0; i < length; i++)
            {
                num = random_.Next(0, 16);
                hexValue += num.ToString("X");
            }

            return hexValue;
        }

        /// <summary>
        /// Generates a random integer string of the specified size.
        /// </summary>
        /// <param name="length">The length of the integer string to generate.</param>
        /// <returns>A random integer string of the specified length.</returns>
        private static string randomIntString(int length)
        {
            // 64 character precision or 256-bits
            string value = string.Empty;
            int num;

            for (int i = 0; i < length; i++)
            {
                num = random_.Next(0, 10);
                value += num.ToString("X");
            }

            return value;
        }

        /// <summary>
        /// Generates a random ASCII string of the specified size with optional extended ASCII characters.
        /// </summary>
        /// <param name="length">The length of the ASCII string to generate.</param>
        /// <param name="useExtendedAscii">If true, includes extended ASCII characters in the generated string.</param>
        /// <returns>A random ASCII string of the specified length.</returns>
        private static string randomAsciiString(int length, bool useExtendedAscii = false)
        {
            string value = string.Empty;
            int num;

            int minValue = 32;
            int maxValue = useExtendedAscii ? 254 : 126;

            for (int i = 0; i < length; i++)
            {
                num = random_.Next(minValue, maxValue + 1);

                // prevent DEL, '{' and '}'
                while (num == 127 /*|| num == 123 || num == 125*/)
                    num = random_.Next(minValue, maxValue + 1);

                value += (char)num;
            }

            return value;
        }

        /// <summary>
        /// Generates a random string of the specified size with a maximum byte count.
        /// </summary>
        /// <param name="length">The length of the string to generate.</param>
        /// <param name="maxBytes">The maximum byte count of the generated string.</param>
        /// <returns>A random string of the specified length.</returns>
        private static string randomString(int length, int maxBytes)
        {
            string str = String.Concat(RandomSequence().Where(x => !char.IsControl(x)).Take(length));
            while (UTF8Encoding.UTF8.GetByteCount(str) > maxBytes)
                str = String.Concat(RandomSequence().Where(x => !char.IsControl(x)).Take(length));

            return str;
        }

        /// <summary>
        /// Generates a random sequence of characters.
        /// </summary>
        /// <returns>An enumerable sequence of random characters.</returns>
        private static IEnumerable<char> RandomSequence()
        {
            while (true)
            {
                int val = random_.Next(char.MinValue, char.MaxValue);

                // do not accept:
                //  - surrogate characters (0xD800 - 0xDFFF) (55296 - 57343)
                //  - special characters (0xFFFE - 0xFFFF) (65534 - 65535)
                while ((val >= 55296 && val <= 57343)
                     || val == 65534
                     || val == 65535
                      )
                    val = random_.Next(char.MinValue, char.MaxValue);

                yield return (char)val;
            }
        }

        /// <summary>
        /// Generates a random string of the specified size using a cryptographically secure random number generator.
        /// </summary>
        /// <param name="length">The length of the string to generate.</param>
        /// <returns>A random string of the specified length.</returns>
        private static string randomString2(int length)
        {
            var b = new byte[length];
            new RNGCryptoServiceProvider().GetBytes(b);
            return Encoding.ASCII.GetString(b);
        }
    }
}
