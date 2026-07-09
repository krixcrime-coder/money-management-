import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ScreenshotUpload({ dayNumber, onSuccess }: { dayNumber: number, onSuccess: () => void }) {
  const { user, userProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !user || !userProfile) return;
    setUploading(true);

    try {
      const storageRef = ref(storage, `screenshots/${user.uid}/${dayNumber}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'screenshots'), {
        userId: user.uid,
        userName: userProfile.name,
        date: serverTimestamp(),
        dayNumber,
        imageUrl,
        status: 'pending',
      });

      const dayDocRef = doc(db, `users/${user.uid}/dailyProgress`, dayNumber.toString());
      await updateDoc(dayDocRef, {
        screenshotUrl: imageUrl,
        screenshotUploadedAt: serverTimestamp(),
      });

      toast.success('Screenshot uploaded successfully');
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload screenshot');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 glass-card mt-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/20 p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Upload Balance Screenshot</h3>
          <p className="text-sm text-muted-foreground">Verify your final balance for today.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          className="cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-primary/20 file:transition-colors bg-black/20 border-white/10"
        />
        <Button onClick={handleUpload} disabled={!file || uploading} className="min-w-[120px]">
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading
            </div>
          ) : 'Upload'}
        </Button>
      </div>
    </div>
  );
}
