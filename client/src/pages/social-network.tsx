import SocialNetwork from "../components/chat/SocialNetwork";
import { SocialNetworkHeader } from "../components/ui/social-network-header";
import { CustomizableBottomNav } from "../components/ui/customizable-bottom-nav";
import { Container } from "../components/ui/container";
import { usePageTitle } from "../lib/hooks/usePageTitle";

export default function SocialNetworkPage() {
  usePageTitle("Social Network");
  
  return (
    <>
      <SocialNetworkHeader />
      
      <Container className="pb-16">
        <SocialNetwork />
      </Container>
      
      <CustomizableBottomNav />
    </>
  );
}