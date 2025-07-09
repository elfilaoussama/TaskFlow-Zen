
"use client";

import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Attachment } from '@/lib/types';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

interface AttachmentViewerModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  attachment: Attachment | null;
}

export function AttachmentViewerModal({ isOpen, setIsOpen, attachment }: AttachmentViewerModalProps) {
  if (!attachment || attachment.type !== 'file') {
    return null;
  }

  const handleDownload = () => {
    if (attachment.type === 'file') {
      const link = document.createElement('a');
      link.href = attachment.dataUri;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle className="truncate">{attachment.name}</DialogTitle>
           <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex items-center justify-center bg-muted/50 rounded-md">
            {attachment.fileType.startsWith('image/') ? (
              <div className="relative w-full h-full">
                <Image
                  src={attachment.dataUri}
                  alt={attachment.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : attachment.fileType === 'application/pdf' ? (
              <iframe
                src={attachment.dataUri}
                title={attachment.name}
                className="w-full h-full"
                style={{ height: 'calc(90vh - 100px)' }}
              />
            ) : (
              <div className="text-center p-8">
                <p className="font-semibold">Preview not available</p>
                <p className="text-sm text-muted-foreground">
                  You can download the file to view it.
                </p>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
