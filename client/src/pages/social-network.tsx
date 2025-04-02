import { Helmet } from "react-helmet-async";
import SocialNetwork from "../components/chat/SocialNetwork";
import { SocialNetworkHeader } from "../components/ui/social-network-header";
import { CustomizableBottomNav } from "../components/ui/customizable-bottom-nav";
import { Container } from "../components/ui/container";

export default function SocialNetworkPage() {
  return (
    <>
      <Helmet>
        <title>Social Network | Trade Hybrid</title>
      </Helmet>
      
      <SocialNetworkHeader />
      
      <Container className="pb-16">
        <SocialNetwork />
      </Container>
      
      <CustomizableBottomNav />
    </>
  );
}