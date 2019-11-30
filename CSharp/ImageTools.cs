using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows.Media.Imaging;

namespace CodeSamples.CSharp
{
    public class ImageTools
    {
        /// <summary>
        /// Converts the Bitmap to BitmapImage. This needs to be done in order for the Att Dll to receive the image.
        /// </summary>
        /// <param name="bitmap"></param>
        /// <returns></returns>
        private static BitmapImage Bitmap2BitmapImage(Bitmap bitmap)
        {
            using (MemoryStream memory = new MemoryStream())
            {
                bitmap.Save(memory, ImageFormat.Png);
                memory.Position = 0;

                BitmapImage bitmapImage = new BitmapImage();
                bitmapImage.BeginInit();
                bitmapImage.StreamSource = memory;
                bitmapImage.CacheOption = BitmapCacheOption.OnLoad;
                bitmapImage.EndInit();

                return bitmapImage;
            }
        }

        public static Bitmap BitmapFromSource(BitmapSource bitmapsource)
        {
            Bitmap bitmap;
            using (var outStream = new MemoryStream())
            {
                BitmapEncoder enc = new BmpBitmapEncoder();
                enc.Frames.Add(BitmapFrame.Create(bitmapsource));
                enc.Save(outStream);
                bitmap = new Bitmap(outStream);
            }
            return bitmap;
        }

        public static Bitmap BitmapFromSource2(BitmapSource source, PixelFormat format = PixelFormat.Format1bppIndexed)
        {
            Bitmap bmp = new Bitmap
            (
              source.PixelWidth,
              source.PixelHeight,
              format
            );

            BitmapData data = bmp.LockBits
            (
                new Rectangle(Point.Empty, bmp.Size),
                ImageLockMode.WriteOnly,
                format
            );

            source.CopyPixels
            (
              System.Windows.Int32Rect.Empty,
              data.Scan0,
              data.Height * data.Stride,
              data.Stride
            );

            bmp.UnlockBits(data);

            return bmp;
        }

		// add white borders around image
        public static Bitmap AddBordersToImage(Bitmap image, int borderSize)
        {
            if (image == null)
                return null;
           
            int w = image.Width;
            int h = image.Height;

            Bitmap bmp = null;
            switch (image.PixelFormat)
            {
                case PixelFormat.Format1bppIndexed:
                    {
                        // create white image
                        bmp = new Bitmap(w + 2 * borderSize, h + 2 * borderSize, PixelFormat.Format24bppRgb);
                        using (Graphics graph = Graphics.FromImage(bmp))
                        {
                            Rectangle ImageSize = new Rectangle(0, 0, w + 2 * borderSize, h + 2 * borderSize);
                            graph.FillRectangle(Brushes.White, ImageSize);
                        }

                        for (int y = 0; y < h; y++)
                        {
                            for (int x = 0; x < w; x++)
                            {
                                Color color = image.GetPixel(x, y);
                                bmp.SetPixel(x + borderSize, y + borderSize, color);
                            }
                        }

                        break;
                    }

                default:
                    {
                        // create white image
                        bmp = new Bitmap(w + 2 * borderSize, h + 2 * borderSize, image.PixelFormat);
                        using (Graphics graph = Graphics.FromImage(bmp))
                        {
                            Rectangle ImageSize = new Rectangle(0, 0, w + 2 * borderSize, h + 2 * borderSize);
                            graph.FillRectangle(Brushes.White, ImageSize);
                        }

                        // copy image
                        Rectangle srcRegion = new Rectangle(0, 0, w, h);
                        Rectangle dstRegion = new Rectangle(borderSize, borderSize, w - borderSize, h - borderSize);
                        copyRegionIntoImage(image, srcRegion, ref bmp, dstRegion);

                        break;
                    }
            }

            return bmp;
        }

        private static void copyRegionIntoImage(Bitmap srcBitmap, Rectangle srcRegion, ref Bitmap dstBitmap, Rectangle dstRegion)
        {
            using (Graphics g = Graphics.FromImage(dstBitmap))
            {
                g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;

                g.DrawImage(srcBitmap, dstRegion, srcRegion, GraphicsUnit.Pixel);
            }
        }

        public static ImageCodecInfo GetImageEncoder(ImageFormat format)
        {
            ImageCodecInfo[] codecs = ImageCodecInfo.GetImageDecoders();
            foreach (ImageCodecInfo codec in codecs)
            {
                if (codec.FormatID == format.Guid)
                {
                    return codec;
                }
            }
            return null;
        }
    }
}
