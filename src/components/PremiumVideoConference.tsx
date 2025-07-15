import React from "react";
import { PremiumFeatureGuard } from "./PremiumFeatureGuard";
import { VideoConference } from "./VideoConference";

export const PremiumVideoConference: React.FC = (props) => {
  return (
    <PremiumFeatureGuard>
      <VideoConference isOpen={true} onClose={() => {}} isPictureInPicture={false} onTogglePictureInPicture={() => {}} contact={{id: '', name: '', avatar: ''}} />
    </PremiumFeatureGuard>
  );
}; 