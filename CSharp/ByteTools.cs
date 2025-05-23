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

        /// <summary>
        /// Copies a range of bytes from the source array starting at the specified offset to the end.
        /// </summary>
        /// <param name="src">The source byte array.</param>
        /// <param name="offset">The zero-based offset at which to start copying.</param>
        /// <returns>A new byte array containing the copied range.</returns>
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

        /// <summary>
        /// Copies a specified range of bytes from the source array.
        /// </summary>
        /// <param name="src">The source byte array.</param>
        /// <param name="start">The zero-based starting position in the source array.</param>
        /// <param name="end">The position in the source array at which to stop copying (exclusive).</param>
        /// <returns>A new byte array containing the specified range.</returns>
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

        /// <summary>
        /// Converts a byte to its unsigned integer representation.
        /// </summary>
        /// <param name="b">The byte to convert.</param>
        /// <returns>An integer representing the unsigned value of the byte.</returns>
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

        /// <summary>
        /// Converts a byte array to a string using the default encoding.
        /// </summary>
        /// <param name="array">The byte array to convert.</param>
        /// <returns>A string representation of the byte array, or null if the input is null.</returns>
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

        /// <summary>
        /// Converts a string to a byte array using the default encoding.
        /// </summary>
        /// <param name="text">The string to convert.</param>
        /// <returns>A byte array representing the string, or null if the input is null or empty.</returns>
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

        /// <summary>
        /// Trims null bytes from the end of a byte array.
        /// </summary>
        /// <param name="array">The byte array to trim.</param>
        /// <param name="addLastZero">If true, ensures the result ends with a zero byte.</param>
        /// <returns>A new byte array with trailing null bytes removed.</returns>
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

        /// <summary>
        /// Trims a byte array to the specified length.
        /// </summary>
        /// <param name="array">The byte array to trim.</param>
        /// <param name="index">The index at which to trim the array.</param>
        /// <returns>A new byte array with the specified length.</returns>
        public static byte[] TrimByteArrayToIndex(byte[] array, int index)
        {
            Array.Resize(ref array, index);

            return array;
        }
    }
}
