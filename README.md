# SurfSense AI 🏄‍♂️

**AI-Powered Surf Forecasting & Alert System**

SurfSense AI is a modern web application that provides personalized surf forecasting, real-time condition alerts, and AI-powered recommendations to help surfers find the perfect waves.

## ✨ Features

### 🤖 AI-Powered Recommendations

- Intelligent surf spot suggestions based on your skill level and preferences [2](#0-1)
- Real-time chat assistant for surf condition queries [3](#0-2)
- Personalized forecasting with surfability scoring [4](#0-3)

### 📱 User Management

- Secure authentication with Supabase [5](#0-4)
- Customizable user profiles with skill level tracking [6](#0-5)
- Favorite surf spots management [7](#0-6)

### 🚨 Smart Alerts System

- Custom alerts for wave height, wind conditions, and surfability scores [8](#0-7)
- Real-time notifications when conditions match your preferences [9](#0-8)
- Spot-specific alert configuration [10](#0-9)

### 🌊 Comprehensive Surf Data

- Global surf spot database with difficulty ratings [11](#0-10)
- Advanced search and filtering by location, difficulty, and conditions [12](#0-11)
- Real-time forecast data integration [4](#0-3)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **UI Components**: Radix UI primitives with Tailwind CSS [13](#0-12)
- **Backend**: Next.js API Routes with Supabase integration [14](#0-13)
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth [15](#0-14)
- **AI**: OpenAI GPT-4 integration for intelligent recommendations [16](#0-15)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account and project
- OpenAI API key

### Installation

1. Clone the repository

```bash
git clone https://github.com/xavirodriguez/surfsense.git
cd surfsense
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
# Add your Supabase and OpenAI credentials
```

4. Run the development server

```bash
npm run dev
```

## 📊 API Reference

### User Management

- `GET /api/profile` - Get user profile [17](#0-16)
- `PATCH /api/profile` - Update user profile [18](#0-17)
- `GET /api/favorites` - Get user's favorite spots [19](#0-18)
- `POST /api/favorites` - Add spot to favorites [20](#0-19)

### Surf Data

- `GET /api/spots` - Search and filter surf spots [21](#0-20)

### AI Features

- `POST /api/chat` - AI-powered surf recommendations [22](#0-21)

## 🏗️ Architecture

The application follows a modern full-stack architecture with:

- **Server-side rendering** for optimal performance [23](#0-22)
- **Real-time data synchronization** with Supabase [9](#0-8)
- **Responsive UI components** built on Radix primitives [24](#0-23)
- **Type-safe API routes** with comprehensive error handling [25](#0-24)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to submit pull requests, report issues, and suggest improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the surfing community**

## Notes

This README is based on the current codebase structure which includes a comprehensive surf forecasting system with AI integration, user management, and real-time alerts <cite/>. The application uses modern web technologies including Next.js 14, Supabase for backend services, and OpenAI for AI-powered recommendations <cite/>. The component architecture follows a layered approach with reusable UI primitives and application-specific pages <cite/>.

Wiki pages you might want to explore:

- [User Management API (xavirodriguez/surfsense)](/wiki/xavirodriguez/surfsense#4.2)
- [Frontend Components (xavirodriguez/surfsense)](/wiki/xavirodriguez/surfsense#5)
- [Application Pages (xavirodriguez/surfsense)](/wiki/xavirodriguez/surfsense#5.2)

### Citations

**File:** app/alerts/page.tsx (L1-5)

```typescript
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { RealtimeAlertList } from "@/components/realtime-alert-list";
```

**File:** app/alerts/page.tsx (L6-6)

```typescript
export default async function AlertsPage() {
```

**File:** app/alerts/page.tsx (L7-14)

```typescript
const supabase = await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  redirect("/auth/login");
}
```

**File:** app/alerts/page.tsx (L20-29)

```typescript
const { data: alerts } = await supabase
  .from("alerts")
  .select(
    `
      *,
      surf_spots (name, region, country)
    `
  )
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
```

**File:** app/alerts/page.tsx (L41-41)

```typescript
<RealtimeAlertList userId={user.id} initialAlerts={alerts || []} />
```

**File:** app/api/chat/route.ts (L5-74)

```typescript
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { messages } = await request.json();

    // Get user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Get recent forecasts for context
    const now = new Date().toISOString();
    const { data: spots } = await supabase
      .from("surf_spots")
      .select("id, name, country, region, difficulty")
      .limit(20);

    const { data: forecasts } = await supabase
      .from("forecasts")
      .select(
        "spot_id, wave_height_min, wave_height_max, wind_speed, surfability_score, ai_recommendation"
      )
      .gte("timestamp", now)
      .order("timestamp")
      .limit(50);

    // Build context for AI
    const contextMessage = `You are SurfSense AI, an expert surf forecasting assistant. 

User Profile:
- Skill Level: ${profile?.skill_level || "intermediate"}
- Preferred Wave Height: ${profile?.preferred_wave_height_min || "any"} - ${
      profile?.preferred_wave_height_max || "any"
    }m

Available Surf Spots (sample):
${spots
  ?.map(
    (s: any) =>
      `- ${s.name} (${s.country}): ${s.difficulty || "unknown"} difficulty`
  )
  .join("\n")}

Recent Forecast Data:
${forecasts
  ?.slice(0, 10)
  .map(
    (f: any) =>
      `- Spot: ${
        spots?.find((s: any) => s.id === f.spot_id)?.name || "Unknown"
      }, Waves: ${f.wave_height_min}-${f.wave_height_max}m, Wind: ${
        f.wind_speed
      }kts, Score: ${f.surfability_score}/10`
  )
  .join("\n")}

Help the user find the best surf conditions, answer questions about spots, and provide personalized recommendations based on their skill level and preferences. Be concise, friendly, and surf-focused.`;

    const result = streamText({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: contextMessage,
        },
        ...messages,
      ],
      temperature: 0.7,
      maxTokens: 500,
    });
    return "";
    // return result.toDataStreamResponse()
  } catch (error) {
    console.error("[v0] Chat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Chat failed",
      },
      { status: 500 }
    );
  }
}
```

**File:** app/api/profile/route.ts (L1-2)

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
```

**File:** app/api/profile/route.ts (L4-27)

```typescript
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[v0] Error fetching profile:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}
```

**File:** app/api/profile/route.ts (L29-54)

```typescript
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("profiles")
      .update(body)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[v0] Error updating profile:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 }
    );
  }
}
```

**File:** app/api/favorites/route.ts (L4-36)

```typescript
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        *,
        surf_spots (*)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[v0] Error fetching favorites:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch favorites",
      },
      { status: 500 }
    );
  }
}
```

**File:** app/api/favorites/route.ts (L38-74)

```typescript
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { spot_id } = await request.json();

    if (!spot_id) {
      return NextResponse.json(
        { success: false, error: "spot_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        spot_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[v0] Error adding favorite:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to add favorite",
      },
      { status: 500 }
    );
  }
}
```

**File:** app/api/spots/route.ts (L4-43)

```typescript
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const country = searchParams.get("country");
    const difficulty = searchParams.get("difficulty");
    const limit = Number.parseInt(searchParams.get("limit") || "50");

    let query = supabase.from("surf_spots").select("*").order("name");

    // Apply filters
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,region.ilike.%${search}%`
      );
    }

    if (country) {
      query = query.eq("country", country);
    }

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[v0] Error fetching spots:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch spots",
      },
      { status: 500 }
    );
  }
}
```

**File:** components/ui/sidebar.tsx (L30-33)

```typescript
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
```

**File:** components/ui/sidebar.tsx (L35-54)

```typescript
type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}
```
