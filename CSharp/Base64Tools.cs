using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace CodeSamples.CSharp
{
    public class ByteTools
    {
        public static string Base64Encode(string text)
        {
            var textBytes = System.Text.Encoding.UTF8.GetBytes(text);
            return System.Convert.ToBase64String(textBytes);
        }

        public static string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }

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
