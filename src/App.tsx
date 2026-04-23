import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  setAuthTokenGetter,
} from "@workspace/api-client-react";

function getValidStoredToken() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;

  try {
    const [, payloadSegment] = token.split(".");
    if (!payloadSegment) throw new Error("Missing JWT payload");

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));

    if (typeof payload?.iss !== "string" || !payload.iss.includes("supabase")) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return null;
    }

    return token;
  } catch {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return null;
  }
}

setAuthTokenGetter(() => getValidStoredToken());

import Home from "./pages/home";
import Feed from "./pages/feed";
import Competitions from "./pages/competitions";
import CompetitionDetail from "./pages/competition-detail";
import Karaoke from "./pages/karaoke";
import SearchPage from "./pages/search";
import Leaderboard from "./pages/leaderboard";
import Profile from "./pages/profile";
import LiveRoom from "./pages/live-room";
import Login from "./pages/login";
import Register from "./pages/register";
import Doping from "./pages/doping";
import Upload from "./pages/upload";
import Brands from "./pages/brands";
import BrandDetail from "./pages/brand-detail";
import Talents from "./pages/talents";
import Admin from "./pages/admin";
import Wallet from "./pages/wallet";
import Legal from "./pages/legal";
import Challenges from "./pages/challenges";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/feed" component={Feed} />
      <Route path="/competitions" component={Competitions} />
      <Route path="/competitions/:id" component={CompetitionDetail} />
      <Route path="/karaoke" component={Karaoke} />
      <Route path="/search" component={SearchPage} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/live/:roomId" component={LiveRoom} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/doping" component={Doping} />
      <Route path="/upload" component={Upload} />
      <Route path="/brands" component={Brands} />
      <Route path="/brands/:id" component={BrandDetail} />
      <Route path="/talents" component={Talents} />
      <Route path="/admin" component={Admin} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/legal" component={Legal} />
      <Route path="/challenges" component={Challenges} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
