using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace CodeSamples.CSharp
{
    /// <summary>
    /// Provides utility methods for encoding and decoding data using Base64 and handling byte conversions.
    /// </summary>
    public class ByteTools
    {
        /// <summary>
        /// Encodes a string to its Base64 string representation using UTF-8 encoding.
        /// </summary>
        /// <param name="text">The input string to be encoded.</param>
        /// <returns>A Base64 encoded string representation of the input.</returns>
        public static string Base64Encode(string text)
        {
            var textBytes = System.Text.Encoding.UTF8.GetBytes(text);
            return System.Convert.ToBase64String(textBytes);
        }

        /// <summary>
        /// Decodes a Base64 encoded string back to its original string using UTF-8 encoding.
        /// </summary>
        /// <param name="base64EncodedData">The Base64 encoded string to be decoded.</param>
        /// <returns>The decoded string.</returns>
        /// <exception cref="System.ArgumentNullException">Thrown when the input string is null.</exception>
        /// <exception cref="System.FormatException">Thrown when the input is not a valid Base64 string.</exception>
        public static string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }

        /// <summary>
        /// Converts a Bitmap image to its Base64 string representation using the specified image format.
        /// </summary>
        /// <param name="bmp">The Bitmap image to be encoded.</param>
        /// <param name="format">The image format to use when saving the bitmap.</param>
        /// <returns>A Base64 encoded string representing the image.</returns>
        /// <exception cref="System.ArgumentNullException">Thrown when the input bitmap is null.</exception>
        /// <exception cref="System.Runtime.InteropServices.ExternalException">Thrown when the image could not be saved to the stream.</exception>
        public static string Base64EncodeImage(Bitmap bmp, ImageFormat format)
        {
            string res = "";

            using (var ms = new MemoryStream())
            {
                using (var bitmap = bmp)
                {
                    bitmap.Save(ms, format);
                    res = Convert.ToBase64String(ms.GetBuffer()); // get Base64
                }
            }

            return res;
        }
    }
}
