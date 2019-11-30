using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Xml;
using System.Xml.Serialization;

namespace CodeSamples.CSharp
{
    public class JSONTools
    {
        #region Serialize / Parse methods

        public static string Serialize<T>(T data)
        {
            MemoryStream stream = new MemoryStream();
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(T));
            serializer.WriteObject(stream, data);
            stream.Position = 0;
            StreamReader reader = new StreamReader(stream);
            string res = reader.ReadToEnd();

            return res;
        }

        public static T Deserialize<T>(string json)
        {
            MemoryStream stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(T));
            T data = (T)serializer.ReadObject(stream);
            stream.Close();

            return data;
        }

        public static T[] DeserializeArray<T>(string json)
        {
            MemoryStream stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(T[]));
            T[] data = serializer.ReadObject(stream) as T[];
            stream.Close();

            return data;
        }

        #endregion
    }
}
