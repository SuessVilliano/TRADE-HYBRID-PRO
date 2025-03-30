import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Copy, Zap } from 'lucide-react';
import { tradeSignalService } from '@/lib/services/trade-signal-service';

interface CopyTradeButtonProps {
  signalId: string;
  onCopy?: (autoExecute: boolean) => void;
}

export function CopyTradeButton({ signalId, onCopy }: CopyTradeButtonProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Handle the copy action
  const handleCopy = () => {
    // Copy signal data to ABATEV panel
    tradeSignalService.copySignalToABATEV(signalId);
    
    // Call the parent callback if provided
    if (onCopy) {
      onCopy(false);
    }
  };

  // Handle the auto-execute action
  const handleExecute = () => {
    // Show confirmation dialog
    setIsConfirmDialogOpen(true);
  };

  // Confirm auto-execution
  const confirmAutoExecute = () => {
    // Execute the signal via ABATEV
    tradeSignalService.executeSignalViaABATEV(signalId);
    
    // Call the parent callback if provided
    if (onCopy) {
      onCopy(true);
    }
    
    // Close the dialog
    setIsConfirmDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="h-7 w-7"
            title="Copy trade"
          >
            <Copy size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopy}>
            <Copy size={14} className="mr-2" />
            <span>Copy to ABATEV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExecute}>
            <Zap size={14} className="mr-2" />
            <span>Auto-Execute</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Confirmation Dialog for Auto-Execute */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Auto-Execution</AlertDialogTitle>
            <AlertDialogDescription>
              This will automatically copy and execute the trade signal in ABATEV without any additional confirmation.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAutoExecute}>
              <Zap size={16} className="mr-2" />
              Auto-Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default CopyTradeButton;