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
    /// <summary>
    /// Provides utility methods for JSON serialization and deserialization.
    /// </summary>
    public class JSONTools
    {
        #region Serialize / Parse methods

        /// <summary>
        /// Serializes the specified object to a JSON string.
        /// </summary>
        /// <typeparam name="T">The type of the object to serialize.</typeparam>
        /// <param name="data">The object to serialize.</param>
        /// <returns>A JSON string representation of the object.</returns>
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

        /// <summary>
        /// Deserializes the JSON string to the specified .NET type.
        /// </summary>
        /// <typeparam name="T">The target type to deserialize to.</typeparam>
        /// <param name="json">The JSON string to deserialize.</param>
        /// <returns>The deserialized object of type T.</returns>
        public static T Deserialize<T>(string json)
        {
            MemoryStream stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(T));
            T data = (T)serializer.ReadObject(stream);
            stream.Close();

            return data;
        }

        /// <summary>
        /// Deserializes the JSON string to an array of the specified .NET type.
        /// </summary>
        /// <typeparam name="T">The target array element type.</typeparam>
        /// <param name="json">The JSON string to deserialize.</param>
        /// <returns>An array of deserialized objects of type T.</returns>
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
