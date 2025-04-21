// TradeHybrid NinjaTrader 8 Connector
// Version 1.0.0
// © 2025 Trade Hybrid Platform
//
// This NinjaScript Add-on connects NinjaTrader 8 to the Trade Hybrid platform,
// allowing automated trade execution from Trade Hybrid signals and webhooks.

#region Using declarations
using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Windows.Forms;
using System.Windows.Media;
using System.ComponentModel;
using NinjaTrader.Cbi;
using NinjaTrader.Data;
using NinjaTrader.Core;
using NinjaTrader.NinjaScript;
using NinjaTrader.Core.FloatingPoint;
using NinjaTrader.NinjaScript.Indicators;
using NinjaTrader.NinjaScript.DrawingTools;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Text;
#endregion

namespace NinjaTrader.NinjaScript.AddOns
{
    public class TradeHybridConnector : AddOnBase
    {
        private HttpListener httpListener;
        private Thread listenerThread;
        private volatile bool running = false;
        private string apiKey = "";
        private string endpoint = "http://localhost:8081/";
        private int port = 8081;
        private Account selectedAccount = null;
        private NTWindow connectorWindow;
        private readonly object locker = new object();
        private readonly List<TradeSignal> signalLog = new List<TradeSignal>();
        private readonly int maxLogEntries = 50;

        #region Trade Signal Class
        private class TradeSignal
        {
            public DateTime Timestamp { get; set; }
            public string Symbol { get; set; }
            public string Action { get; set; }
            public int Quantity { get; set; }
            public string OrderType { get; set; }
            public double? LimitPrice { get; set; }
            public double? StopPrice { get; set; }
            public string Status { get; set; }
            public string Message { get; set; }

            public TradeSignal()
            {
                Timestamp = DateTime.Now;
                Status = "Pending";
            }

            public override string ToString()
            {
                return string.Format("[{0}] {1} {2} {3} {4} (Status: {5})", 
                    Timestamp.ToString("HH:mm:ss"), 
                    Action, 
                    Quantity, 
                    Symbol, 
                    OrderType,
                    Status);
            }
        }
        #endregion

        #region Initialization and Cleanup
        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = "Trade Hybrid Connector for NinjaTrader 8";
                Name = "Trade Hybrid Connector";
            }
            else if (State == State.Configure)
            {
                // Load settings from file
                LoadSettings();
            }
            else if (State == State.Active)
            {
                // Create and show the connector window
                if (connectorWindow == null)
                {
                    try
                    {
                        connectorWindow = new NTWindow
                        {
                            Caption = "Trade Hybrid Connector",
                            Width = 600,
                            Height = 400,
                            WindowStartupLocation = System.Windows.WindowStartupLocation.CenterScreen,
                            Content = new ConnectorTab(this)
                        };
                        connectorWindow.Show();
                    }
                    catch (Exception ex)
                    {
                        Print("Error creating connector window: " + ex.Message);
                    }
                }

                // Start the listener
                StartListener();
            }
            else if (State == State.Terminated)
            {
                // Stop the listener
                StopListener();

                // Close the connector window
                if (connectorWindow != null)
                {
                    connectorWindow.Close();
                    connectorWindow = null;
                }
            }
        }

        private void LoadSettings()
        {
            try
            {
                string settingsPath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                    "NinjaTrader 8", 
                    "tradehybrid_settings.json"
                );

                if (File.Exists(settingsPath))
                {
                    string json = File.ReadAllText(settingsPath);
                    dynamic settings = JsonConvert.DeserializeObject(json);

                    apiKey = settings.ApiKey;
                    port = settings.Port ?? 8081;
                    endpoint = string.Format("http://localhost:{0}/", port);
                }
                else
                {
                    // Create default settings file
                    SaveSettings();
                }
            }
            catch (Exception ex)
            {
                Print("Error loading settings: " + ex.Message);
            }
        }

        public void SaveSettings()
        {
            try
            {
                string settingsPath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                    "NinjaTrader 8", 
                    "tradehybrid_settings.json"
                );

                var settings = new
                {
                    ApiKey = apiKey,
                    Port = port
                };

                string json = JsonConvert.SerializeObject(settings, Formatting.Indented);
                File.WriteAllText(settingsPath, json);
            }
            catch (Exception ex)
            {
                Print("Error saving settings: " + ex.Message);
            }
        }
        #endregion

        #region HTTP Listener
        private void StartListener()
        {
            if (running)
                return;

            try
            {
                if (httpListener == null)
                {
                    httpListener = new HttpListener();
                    httpListener.Prefixes.Add(endpoint);
                }

                httpListener.Start();
                running = true;

                listenerThread = new Thread(ListenerThreadProc);
                listenerThread.IsBackground = true;
                listenerThread.Start();

                Print("Trade Hybrid Connector started on " + endpoint);
                AddLogEntry(null, "Server started on " + endpoint, "Info");
            }
            catch (Exception ex)
            {
                Print("Error starting listener: " + ex.Message);
                AddLogEntry(null, "Error starting server: " + ex.Message, "Error");
            }
        }

        private void StopListener()
        {
            if (!running)
                return;

            try
            {
                running = false;
                
                if (httpListener != null)
                {
                    httpListener.Stop();
                    httpListener.Close();
                    httpListener = null;
                }

                if (listenerThread != null && listenerThread.IsAlive)
                {
                    listenerThread.Join(1000);
                    if (listenerThread.IsAlive)
                        listenerThread.Abort();
                    listenerThread = null;
                }

                Print("Trade Hybrid Connector stopped");
                AddLogEntry(null, "Server stopped", "Info");
            }
            catch (Exception ex)
            {
                Print("Error stopping listener: " + ex.Message);
            }
        }

        private void ListenerThreadProc()
        {
            while (running)
            {
                try
                {
                    var context = httpListener.GetContext();
                    Task.Run(() => ProcessRequest(context));
                }
                catch (Exception ex)
                {
                    if (running)
                    {
                        Print("Error in listener thread: " + ex.Message);
                    }
                    // If not running, this is likely due to the listener being stopped
                }
            }
        }

        private void ProcessRequest(HttpListenerContext context)
        {
            try
            {
                var request = context.Request;
                var response = context.Response;

                // Set CORS headers
                response.Headers.Add("Access-Control-Allow-Origin", "*");
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

                // Handle preflight OPTIONS request
                if (request.HttpMethod == "OPTIONS")
                {
                    response.StatusCode = 200;
                    response.Close();
                    return;
                }

                // Check for API key if configured
                if (!string.IsNullOrEmpty(apiKey))
                {
                    string requestApiKey = request.Headers["X-API-Key"];
                    if (apiKey != requestApiKey)
                    {
                        response.StatusCode = 401;
                        WriteJsonResponse(response, new { error = "Unauthorized - invalid API key" });
                        return;
                    }
                }

                // Process the request based on the path
                string path = request.Url.AbsolutePath.TrimEnd('/');

                if (request.HttpMethod == "GET" && path == "/status")
                {
                    HandleStatusRequest(request, response);
                }
                else if (request.HttpMethod == "GET" && path == "/accounts")
                {
                    HandleAccountsRequest(request, response);
                }
                else if (request.HttpMethod == "GET" && path == "/positions")
                {
                    HandlePositionsRequest(request, response);
                }
                else if (request.HttpMethod == "POST" && path == "/trade")
                {
                    HandleTradeRequest(request, response);
                }
                else
                {
                    response.StatusCode = 404;
                    WriteJsonResponse(response, new { error = "Not found" });
                }
            }
            catch (Exception ex)
            {
                Print("Error processing request: " + ex.Message);
                try
                {
                    context.Response.StatusCode = 500;
                    WriteJsonResponse(context.Response, new { error = "Internal server error", message = ex.Message });
                }
                catch
                {
                    // Ignore any error while trying to send an error response
                }
            }
        }

        private void WriteJsonResponse(HttpListenerResponse response, object data)
        {
            try
            {
                string json = JsonConvert.SerializeObject(data);
                byte[] buffer = Encoding.UTF8.GetBytes(json);

                response.ContentType = "application/json";
                response.ContentLength64 = buffer.Length;
                response.OutputStream.Write(buffer, 0, buffer.Length);
            }
            finally
            {
                response.Close();
            }
        }
        #endregion

        #region Request Handlers
        private void HandleStatusRequest(HttpListenerRequest request, HttpListenerResponse response)
        {
            var status = new
            {
                status = "running",
                version = "1.0.0",
                accounts = Account.All.Count,
                connected = Cbi.Connection.ConnectionStatusId == ConnectionStatus.Connected
            };

            WriteJsonResponse(response, status);
        }

        private void HandleAccountsRequest(HttpListenerRequest request, HttpListenerResponse response)
        {
            var accounts = new List<object>();
            
            foreach (Account account in Account.All)
            {
                accounts.Add(new
                {
                    name = account.Name,
                    displayName = account.DisplayName,
                    id = account.Id,
                    connectionName = account.Connection.Name,
                    denomination = account.Denomination.ToString()
                });
            }

            WriteJsonResponse(response, accounts);
        }

        private void HandlePositionsRequest(HttpListenerRequest request, HttpListenerResponse response)
        {
            // Get the account from the query string, if any
            string accountName = null;
            if (request.QueryString["account"] != null)
            {
                accountName = request.QueryString["account"];
            }

            Account account = null;
            if (!string.IsNullOrEmpty(accountName))
            {
                // Find the specified account
                foreach (Account acct in Account.All)
                {
                    if (acct.Name == accountName)
                    {
                        account = acct;
                        break;
                    }
                }

                if (account == null)
                {
                    response.StatusCode = 404;
                    WriteJsonResponse(response, new { error = "Account not found" });
                    return;
                }
            }
            else
            {
                // Use the selected account or the first available
                account = selectedAccount ?? (Account.All.Count > 0 ? Account.All[0] : null);
                
                if (account == null)
                {
                    response.StatusCode = 400;
                    WriteJsonResponse(response, new { error = "No account selected or available" });
                    return;
                }
            }
            
            var positions = new List<object>();
            foreach (Position position in account.Positions)
            {
                // Skip positions with zero quantity
                if (position.Quantity == 0)
                    continue;
                    
                positions.Add(new
                {
                    symbol = position.Instrument.FullName,
                    marketPosition = position.MarketPosition.ToString(),
                    quantity = position.Quantity,
                    averagePrice = position.AveragePrice,
                    unrealizedPL = position.GetUnrealizedProfitLoss(PerformanceUnit.Currency),
                    realizedPL = position.GetRealizedProfitLoss(PerformanceUnit.Currency)
                });
            }
            
            WriteJsonResponse(response, positions);
        }

        private void HandleTradeRequest(HttpListenerRequest request, HttpListenerResponse response)
        {
            if (request.ContentType != "application/json")
            {
                response.StatusCode = 400;
                WriteJsonResponse(response, new { error = "Content-Type must be application/json" });
                return;
            }

            // Read the request body
            string requestBody;
            using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
            {
                requestBody = reader.ReadToEnd();
            }

            // Parse the JSON body
            JObject requestData;
            try
            {
                requestData = JObject.Parse(requestBody);
            }
            catch (Exception ex)
            {
                response.StatusCode = 400;
                WriteJsonResponse(response, new { error = "Invalid JSON", message = ex.Message });
                return;
            }

            // Validate the required fields
            if (!ValidateTradeRequest(requestData, out string errorMessage))
            {
                response.StatusCode = 400;
                WriteJsonResponse(response, new { error = errorMessage });
                return;
            }

            // Get the trade parameters
            string action = requestData["action"].ToString().ToUpper();
            string symbol = requestData["symbol"].ToString();
            int quantity = requestData["quantity"].Value<int>();
            string orderType = requestData.ContainsKey("orderType") ? requestData["orderType"].ToString().ToUpper() : "MARKET";
            double? limitPrice = requestData.ContainsKey("limitPrice") ? (double?)requestData["limitPrice"].Value<double>() : null;
            double? stopPrice = requestData.ContainsKey("stopPrice") ? (double?)requestData["stopPrice"].Value<double>() : null;
            string accountName = requestData.ContainsKey("account") ? requestData["account"].ToString() : null;

            // Create a trade signal object for logging
            var signal = new TradeSignal
            {
                Symbol = symbol,
                Action = action,
                Quantity = quantity,
                OrderType = orderType,
                LimitPrice = limitPrice,
                StopPrice = stopPrice
            };

            // Process the trade
            try
            {
                // Determine the account to use
                Account account = null;
                if (!string.IsNullOrEmpty(accountName))
                {
                    // Find the specified account
                    foreach (Account acct in Account.All)
                    {
                        if (acct.Name == accountName)
                        {
                            account = acct;
                            break;
                        }
                    }

                    if (account == null)
                    {
                        signal.Status = "Error";
                        signal.Message = "Account not found: " + accountName;
                        AddLogEntry(signal);
                        
                        response.StatusCode = 404;
                        WriteJsonResponse(response, new { error = "Account not found", message = signal.Message });
                        return;
                    }
                }
                else
                {
                    // Use the selected account or the first available
                    account = selectedAccount ?? (Account.All.Count > 0 ? Account.All[0] : null);
                    
                    if (account == null)
                    {
                        signal.Status = "Error";
                        signal.Message = "No account selected or available";
                        AddLogEntry(signal);
                        
                        response.StatusCode = 400;
                        WriteJsonResponse(response, new { error = signal.Message });
                        return;
                    }
                }

                // Get the instrument
                Instrument instrument = null;
                try
                {
                    instrument = Instrument.GetInstrument(symbol);
                }
                catch
                {
                    signal.Status = "Error";
                    signal.Message = "Invalid instrument: " + symbol;
                    AddLogEntry(signal);
                    
                    response.StatusCode = 400;
                    WriteJsonResponse(response, new { error = signal.Message });
                    return;
                }

                // Determine the order action
                OrderAction orderAction;
                if (action == "BUY")
                {
                    orderAction = OrderAction.Buy;
                }
                else if (action == "SELL")
                {
                    orderAction = OrderAction.Sell;
                }
                else if (action == "FLATTEN")
                {
                    // Find the position for this instrument
                    Position position = null;
                    foreach (Position pos in account.Positions)
                    {
                        if (pos.Instrument.FullName == symbol && pos.Quantity != 0)
                        {
                            position = pos;
                            break;
                        }
                    }

                    if (position == null)
                    {
                        signal.Status = "Warning";
                        signal.Message = "No position to flatten for: " + symbol;
                        AddLogEntry(signal);
                        
                        WriteJsonResponse(response, new { 
                            success = true, 
                            message = "No position to flatten", 
                            symbol = symbol, 
                            account = account.Name 
                        });
                        return;
                    }

                    // Determine the action and quantity based on the position
                    orderAction = position.MarketPosition == MarketPosition.Long ? OrderAction.Sell : OrderAction.Buy;
                    quantity = Math.Abs(position.Quantity);
                }
                else
                {
                    signal.Status = "Error";
                    signal.Message = "Invalid action: " + action;
                    AddLogEntry(signal);
                    
                    response.StatusCode = 400;
                    WriteJsonResponse(response, new { error = signal.Message });
                    return;
                }

                // Determine the order type
                OrderType ntOrderType;
                switch (orderType)
                {
                    case "MARKET":
                        ntOrderType = OrderType.Market;
                        break;
                    case "LIMIT":
                        ntOrderType = OrderType.Limit;
                        if (!limitPrice.HasValue)
                        {
                            signal.Status = "Error";
                            signal.Message = "Limit price is required for LIMIT orders";
                            AddLogEntry(signal);
                            
                            response.StatusCode = 400;
                            WriteJsonResponse(response, new { error = signal.Message });
                            return;
                        }
                        break;
                    case "STOP":
                        ntOrderType = OrderType.Stop;
                        if (!stopPrice.HasValue)
                        {
                            signal.Status = "Error";
                            signal.Message = "Stop price is required for STOP orders";
                            AddLogEntry(signal);
                            
                            response.StatusCode = 400;
                            WriteJsonResponse(response, new { error = signal.Message });
                            return;
                        }
                        break;
                    case "STOP_LIMIT":
                        ntOrderType = OrderType.StopLimit;
                        if (!limitPrice.HasValue || !stopPrice.HasValue)
                        {
                            signal.Status = "Error";
                            signal.Message = "Both limit price and stop price are required for STOP_LIMIT orders";
                            AddLogEntry(signal);
                            
                            response.StatusCode = 400;
                            WriteJsonResponse(response, new { error = signal.Message });
                            return;
                        }
                        break;
                    default:
                        signal.Status = "Error";
                        signal.Message = "Invalid order type: " + orderType;
                        AddLogEntry(signal);
                        
                        response.StatusCode = 400;
                        WriteJsonResponse(response, new { error = signal.Message });
                        return;
                }

                // Create the order
                Order order = null;
                switch (ntOrderType)
                {
                    case OrderType.Market:
                        order = account.CreateOrder(instrument, orderAction, ntOrderType, OrderEntry.Manual, TimeInForce.Day, quantity, 0, 0, "", null, null, null, null);
                        break;
                    case OrderType.Limit:
                        order = account.CreateOrder(instrument, orderAction, ntOrderType, OrderEntry.Manual, TimeInForce.Day, quantity, 0, limitPrice.Value, "", null, null, null, null);
                        break;
                    case OrderType.Stop:
                        order = account.CreateOrder(instrument, orderAction, ntOrderType, OrderEntry.Manual, TimeInForce.Day, quantity, stopPrice.Value, 0, "", null, null, null, null);
                        break;
                    case OrderType.StopLimit:
                        order = account.CreateOrder(instrument, orderAction, ntOrderType, OrderEntry.Manual, TimeInForce.Day, quantity, stopPrice.Value, limitPrice.Value, "", null, null, null, null);
                        break;
                }

                // Submit the order
                if (order != null)
                {
                    account.Submit(new[] { order });
                    
                    signal.Status = "Submitted";
                    signal.Message = "Order submitted: " + order.OrderId;
                    AddLogEntry(signal);

                    WriteJsonResponse(response, new { 
                        success = true, 
                        message = "Order submitted", 
                        orderId = order.OrderId.ToString(),
                        symbol = symbol,
                        action = orderAction.ToString(),
                        quantity = quantity,
                        orderType = ntOrderType.ToString(),
                        account = account.Name
                    });
                }
                else
                {
                    signal.Status = "Error";
                    signal.Message = "Failed to create order";
                    AddLogEntry(signal);
                    
                    response.StatusCode = 500;
                    WriteJsonResponse(response, new { error = "Failed to create order" });
                }
            }
            catch (Exception ex)
            {
                signal.Status = "Error";
                signal.Message = "Error executing trade: " + ex.Message;
                AddLogEntry(signal);
                
                response.StatusCode = 500;
                WriteJsonResponse(response, new { error = "Error executing trade", message = ex.Message });
            }
        }

        private bool ValidateTradeRequest(JObject requestData, out string errorMessage)
        {
            errorMessage = null;

            if (!requestData.ContainsKey("action"))
            {
                errorMessage = "Missing required field: action";
                return false;
            }

            if (!requestData.ContainsKey("symbol"))
            {
                errorMessage = "Missing required field: symbol";
                return false;
            }

            if (!requestData.ContainsKey("quantity"))
            {
                errorMessage = "Missing required field: quantity";
                return false;
            }

            string action = requestData["action"].ToString().ToUpper();
            if (action != "BUY" && action != "SELL" && action != "FLATTEN")
            {
                errorMessage = "Invalid action. Must be BUY, SELL, or FLATTEN";
                return false;
            }

            if (action != "FLATTEN")
            {
                int quantity;
                if (!int.TryParse(requestData["quantity"].ToString(), out quantity) || quantity <= 0)
                {
                    errorMessage = "Quantity must be a positive integer";
                    return false;
                }
            }

            if (requestData.ContainsKey("orderType"))
            {
                string orderType = requestData["orderType"].ToString().ToUpper();
                if (orderType != "MARKET" && orderType != "LIMIT" && orderType != "STOP" && orderType != "STOP_LIMIT")
                {
                    errorMessage = "Invalid orderType. Must be MARKET, LIMIT, STOP, or STOP_LIMIT";
                    return false;
                }
            }

            return true;
        }
        #endregion

        #region UI and Logging
        private void AddLogEntry(TradeSignal signal, string message = null, string status = null)
        {
            if (signal == null)
            {
                signal = new TradeSignal();
                signal.Message = message ?? "";
                signal.Status = status ?? "Info";
            }
            else if (!string.IsNullOrEmpty(message))
            {
                signal.Message = message;
                if (!string.IsNullOrEmpty(status))
                    signal.Status = status;
            }

            lock (locker)
            {
                signalLog.Add(signal);
                while (signalLog.Count > maxLogEntries)
                    signalLog.RemoveAt(0);
            }

            if (connectorWindow != null)
            {
                connectorWindow.Dispatcher.InvokeAsync(() =>
                {
                    ConnectorTab tab = connectorWindow.Content as ConnectorTab;
                    if (tab != null)
                        tab.UpdateLog();
                });
            }
        }

        public List<TradeSignal> GetLogEntries()
        {
            lock (locker)
            {
                return new List<TradeSignal>(signalLog);
            }
        }

        public Account SelectedAccount
        {
            get { return selectedAccount; }
            set { selectedAccount = value; }
        }

        public string ApiKey
        {
            get { return apiKey; }
            set 
            { 
                apiKey = value; 
                SaveSettings();
            }
        }

        public int Port
        {
            get { return port; }
            set 
            { 
                if (port != value)
                {
                    port = value;
                    endpoint = string.Format("http://localhost:{0}/", port);
                    SaveSettings();
                    
                    // Restart the listener with the new port
                    if (running)
                    {
                        StopListener();
                        StartListener();
                    }
                }
            }
        }

        public string Endpoint
        {
            get { return endpoint; }
        }

        public bool IsRunning
        {
            get { return running; }
        }

        public void RestartListener()
        {
            StopListener();
            StartListener();
        }
        #endregion
    }

    #region UI Components
    public class ConnectorTab : System.Windows.Controls.Grid
    {
        private TradeHybridConnector connector;
        private System.Windows.Controls.Button startStopButton;
        private System.Windows.Controls.TextBox portTextBox;
        private System.Windows.Controls.TextBox apiKeyTextBox;
        private System.Windows.Controls.ComboBox accountComboBox;
        private System.Windows.Controls.ListBox logListBox;

        public ConnectorTab(TradeHybridConnector connector)
        {
            this.connector = connector;
            BuildUI();
            UpdateUI();
        }

        private void BuildUI()
        {
            // Define rows and columns
            RowDefinitions.Add(new System.Windows.Controls.RowDefinition { Height = new GridLength(30) });
            RowDefinitions.Add(new System.Windows.Controls.RowDefinition { Height = new GridLength(30) });
            RowDefinitions.Add(new System.Windows.Controls.RowDefinition { Height = new GridLength(30) });
            RowDefinitions.Add(new System.Windows.Controls.RowDefinition { Height = new GridLength(30) });
            RowDefinitions.Add(new System.Windows.Controls.RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            
            ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(100) });
            ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(100) });

            // Add controls for row 0 (Status)
            var statusLabel = new System.Windows.Controls.Label { Content = "Status:", VerticalAlignment = System.Windows.VerticalAlignment.Center };
            System.Windows.Controls.Grid.SetRow(statusLabel, 0);
            System.Windows.Controls.Grid.SetColumn(statusLabel, 0);
            Children.Add(statusLabel);

            startStopButton = new System.Windows.Controls.Button { Content = "Stop", Margin = new System.Windows.Thickness(5) };
            startStopButton.Click += (s, e) => 
            {
                if (connector.IsRunning)
                    connector.StopListener();
                else
                    connector.StartListener();
                    
                UpdateUI();
            };
            System.Windows.Controls.Grid.SetRow(startStopButton, 0);
            System.Windows.Controls.Grid.SetColumn(startStopButton, 2);
            Children.Add(startStopButton);
            
            // Add controls for row 1 (Port)
            var portLabel = new System.Windows.Controls.Label { Content = "Port:", VerticalAlignment = System.Windows.VerticalAlignment.Center };
            System.Windows.Controls.Grid.SetRow(portLabel, 1);
            System.Windows.Controls.Grid.SetColumn(portLabel, 0);
            Children.Add(portLabel);

            portTextBox = new System.Windows.Controls.TextBox { Text = connector.Port.ToString(), Margin = new System.Windows.Thickness(5), VerticalContentAlignment = System.Windows.VerticalAlignment.Center };
            System.Windows.Controls.Grid.SetRow(portTextBox, 1);
            System.Windows.Controls.Grid.SetColumn(portTextBox, 1);
            Children.Add(portTextBox);

            var setPortButton = new System.Windows.Controls.Button { Content = "Set Port", Margin = new System.Windows.Thickness(5) };
            setPortButton.Click += (s, e) => 
            {
                int newPort;
                if (int.TryParse(portTextBox.Text, out newPort) && newPort > 0)
                {
                    connector.Port = newPort;
                    UpdateUI();
                }
                else
                {
                    System.Windows.MessageBox.Show("Invalid port number", "Error", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Error);
                    portTextBox.Text = connector.Port.ToString();
                }
            };
            System.Windows.Controls.Grid.SetRow(setPortButton, 1);
            System.Windows.Controls.Grid.SetColumn(setPortButton, 2);
            Children.Add(setPortButton);
            
            // Add controls for row 2 (API Key)
            var apiKeyLabel = new System.Windows.Controls.Label { Content = "API Key:", VerticalAlignment = System.Windows.VerticalAlignment.Center };
            System.Windows.Controls.Grid.SetRow(apiKeyLabel, 2);
            System.Windows.Controls.Grid.SetColumn(apiKeyLabel, 0);
            Children.Add(apiKeyLabel);

            apiKeyTextBox = new System.Windows.Controls.TextBox { Text = connector.ApiKey, Margin = new System.Windows.Thickness(5), VerticalContentAlignment = System.Windows.VerticalAlignment.Center };
            System.Windows.Controls.Grid.SetRow(apiKeyTextBox, 2);
            System.Windows.Controls.Grid.SetColumn(apiKeyTextBox, 1);
            Children.Add(apiKeyTextBox);

            var setApiKeyButton = new System.Windows.Controls.Button { Content = "Set API Key", Margin = new System.Windows.Thickness(5) };
            setApiKeyButton.Click += (s, e) => 
            {
                connector.ApiKey = apiKeyTextBox.Text;
                UpdateUI();
            };
            System.Windows.Controls.Grid.SetRow(setApiKeyButton, 2);
            System.Windows.Controls.Grid.SetColumn(setApiKeyButton, 2);
            Children.Add(setApiKeyButton);
            
            // Add controls for row 3 (Account)
            var accountLabel = new System.Windows.Controls.Label { Content = "Account:", VerticalAlignment = System.Windows.VerticalAlignment.Center };
            System.Windows.Controls.Grid.SetRow(accountLabel, 3);
            System.Windows.Controls.Grid.SetColumn(accountLabel, 0);
            Children.Add(accountLabel);

            accountComboBox = new System.Windows.Controls.ComboBox { Margin = new System.Windows.Thickness(5), VerticalContentAlignment = System.Windows.VerticalAlignment.Center };
            accountComboBox.SelectionChanged += (s, e) => 
            {
                if (accountComboBox.SelectedItem != null)
                {
                    connector.SelectedAccount = accountComboBox.SelectedItem as Account;
                }
            };
            System.Windows.Controls.Grid.SetRow(accountComboBox, 3);
            System.Windows.Controls.Grid.SetColumn(accountComboBox, 1);
            System.Windows.Controls.Grid.SetColumnSpan(accountComboBox, 2);
            Children.Add(accountComboBox);
            
            // Add controls for row 4 (Log)
            var logLabel = new System.Windows.Controls.Label { Content = "Log:", VerticalAlignment = System.Windows.VerticalAlignment.Top };
            System.Windows.Controls.Grid.SetRow(logLabel, 4);
            System.Windows.Controls.Grid.SetColumn(logLabel, 0);
            Children.Add(logLabel);

            logListBox = new System.Windows.Controls.ListBox { Margin = new System.Windows.Thickness(5) };
            System.Windows.Controls.Grid.SetRow(logListBox, 4);
            System.Windows.Controls.Grid.SetColumn(logListBox, 1);
            System.Windows.Controls.Grid.SetColumnSpan(logListBox, 2);
            Children.Add(logListBox);
            
            // Add help text at the bottom
            var helpText = new System.Windows.Controls.TextBlock
            {
                Text = "This connector allows Trade Hybrid to send trade signals to NinjaTrader. " +
                       "Configure Trade Hybrid to use this connector by setting the endpoint to: " +
                       connector.Endpoint,
                TextWrapping = System.Windows.TextWrapping.Wrap,
                Margin = new System.Windows.Thickness(5),
                Foreground = System.Windows.Media.Brushes.Gray,
                FontStyle = FontStyles.Italic
            };
            System.Windows.Controls.Grid.SetRow(helpText, 5);
            System.Windows.Controls.Grid.SetColumn(helpText, 0);
            System.Windows.Controls.Grid.SetColumnSpan(helpText, 3);
            Children.Add(helpText);
        }

        public void UpdateUI()
        {
            // Update the start/stop button
            startStopButton.Content = connector.IsRunning ? "Stop" : "Start";
            
            // Update the port text
            portTextBox.Text = connector.Port.ToString();
            
            // Update the API key text
            apiKeyTextBox.Text = connector.ApiKey;
            
            // Update the account combo box
            accountComboBox.Items.Clear();
            foreach (Account account in Account.All)
            {
                accountComboBox.Items.Add(account);
            }
            
            if (connector.SelectedAccount != null)
            {
                accountComboBox.SelectedItem = connector.SelectedAccount;
            }
            else if (accountComboBox.Items.Count > 0)
            {
                accountComboBox.SelectedIndex = 0;
                connector.SelectedAccount = accountComboBox.SelectedItem as Account;
            }
            
            // Update the log
            UpdateLog();
        }

        public void UpdateLog()
        {
            var logEntries = connector.GetLogEntries();
            
            // Cache selection
            int selectedIndex = logListBox.SelectedIndex;
            
            logListBox.Items.Clear();
            foreach (var entry in logEntries)
            {
                logListBox.Items.Add(entry);
            }
            
            // Restore selection or select the last item
            if (selectedIndex >= 0 && selectedIndex < logListBox.Items.Count)
                logListBox.SelectedIndex = selectedIndex;
            else if (logListBox.Items.Count > 0)
                logListBox.SelectedIndex = logListBox.Items.Count - 1;
                
            // Ensure the selected item is visible
            if (logListBox.SelectedItem != null)
                logListBox.ScrollIntoView(logListBox.SelectedItem);
        }
    }
    #endregion
}