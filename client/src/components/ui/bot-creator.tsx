import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, PlayCircle, PauseCircle, Trash2, Plus, Code, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useBots } from "@/lib/stores/useBots";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface BotCreatorProps {
  className?: string;
}

export function BotCreator({ className }: BotCreatorProps) {
  const { bots, createBot, updateBot, deleteBot, runBot, stopBot } = useBots();
  const [botName, setBotName] = useState("");
  const [strategyType, setStrategyType] = useState("simple");
  const [codeEditor, setCodeEditor] = useState(`// Trading bot logic
function onNewBar(bar) {
  // Simple strategy example
  if (bar.close > bar.sma(14)) {
    return "BUY";
  } else if (bar.close < bar.sma(14)) {
    return "SELL";
  }
  return "HOLD";
}`);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD");
  
  const handleCreateBot = () => {
    if (!botName) return;
    
    createBot({
      name: botName,
      type: strategyType,
      code: codeEditor,
      symbol: selectedSymbol,
      active: false,
    });
    
    // Reset form
    setBotName("");
    setStrategyType("simple");
    setCodeEditor(`// Trading bot logic
function onNewBar(bar) {
  // Simple strategy example
  if (bar.close > bar.sma(14)) {
    return "BUY";
  } else if (bar.close < bar.sma(14)) {
    return "SELL";
  }
  return "HOLD";
}`);
    setSelectedSymbol("BTCUSD");
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>
            <Bot className="inline mr-2 h-5 w-5" />
            Bot Builder
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mybots">
          <TabsList className="grid w-full grid-cols-2 h-8 mb-4">
            <TabsTrigger value="mybots">My Bots</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mybots">
            <ScrollArea className="h-[300px]">
              {bots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Bot className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No bots created yet.</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create your first trading bot to automate your strategies.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("create-tab")?.click()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bot
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bots.map((bot) => (
                    <div key={bot.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Bot className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium">{bot.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => bot.active ? stopBot(bot.id) : runBot(bot.id)}
                          >
                            {bot.active ? (
                              <PauseCircle className="h-4 w-4 text-amber-500" />
                            ) : (
                              <PlayCircle className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteBot(bot.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div>
                          <span className="mr-2">Symbol: {bot.symbol}</span>
                          <span>Type: {bot.type}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={bot.active ? "text-green-500" : "text-muted-foreground"}>
                            {bot.active ? "Running" : "Stopped"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="create" id="create-tab">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bot-name">Bot Name</Label>
                  <Input 
                    id="bot-name" 
                    placeholder="My Trading Bot"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="symbol-select">Symbol</Label>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger id="symbol-select">
                      <SelectValue placeholder="Select Symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTCUSD">BTC/USD</SelectItem>
                      <SelectItem value="ETHUSD">ETH/USD</SelectItem>
                      <SelectItem value="EURUSD">EUR/USD</SelectItem>
                      <SelectItem value="AAPL">Apple Inc.</SelectItem>
                      <SelectItem value="MSFT">Microsoft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="strategy-type">Strategy Type</Label>
                <Select value={strategyType} onValueChange={setStrategyType}>
                  <SelectTrigger id="strategy-type">
                    <SelectValue placeholder="Select Strategy Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="trend">Trend Following</SelectItem>
                    <SelectItem value="mean">Mean Reversion</SelectItem>
                    <SelectItem value="breakout">Breakout</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="code-editor">Strategy Code</Label>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </div>
                <Textarea 
                  id="code-editor" 
                  value={codeEditor}
                  onChange={(e) => setCodeEditor(e.target.value)}
                  className="font-mono text-xs h-[120px]"
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setBotName("")}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBot}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bot
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
