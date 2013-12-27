//#r "System.dll"
//#r "System.Data.dll"

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;

public class Startup
{
    public async Task<object> Invoke(IDictionary<string, object> parameters)
    {
        var commandText = (string)parameters["source"];
        var connectionString = (string)parameters["connectionString"];
        var dataSets = new List<List<object>>();
        var rows = new List<object>();

        using (var connection = new SqlConnection(connectionString))
        {
            using (var command = new SqlCommand(commandText, connection))
            {
                await connection.OpenAsync();
                using (var reader = await command.ExecuteReaderAsync(CommandBehavior.CloseConnection))
                {
                    var record = (IDataRecord)reader;
                    do
                    {
                        while (await reader.ReadAsync())
                        {
                            var dataObject = new ExpandoObject() as IDictionary<string, Object>;
                            var resultRecord = new object[record.FieldCount];
                            record.GetValues(resultRecord);

                            for (int i = 0; i < record.FieldCount; i++)
                            {
                                var type = record.GetFieldType(i);
                                if (type == typeof(byte[]) || type == typeof(char[]))
                                {
                                    resultRecord[i] = Convert.ToBase64String((byte[])resultRecord[i]);
                                }
                                else if (type == typeof(Guid) || type == typeof(DateTime))
                                {
                                    resultRecord[i] = resultRecord[i].ToString();
                                }
                                else if (type == typeof(IDataReader))
                                {
                                    resultRecord[i] = "<IDataReader>";
                                }

                                dataObject.Add(record.GetName(i), resultRecord[i]);
                            }
                            rows.Add(dataObject);
                        }
                        dataSets.Add(rows);
                        rows = new List<object>();
                    }
                    while(await reader.NextResultAsync());
                }
            }
        }

        return dataSets;
    }
}
