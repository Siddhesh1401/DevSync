import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Middleware to extract user from JWT
export const extractUser = (req: AuthRequest, _res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  
  // In a real app, you'd verify the JWT here
  // For now, we'll use Supabase to verify the token
  supabase.auth.getUser(token).then(({ data, error }) => {
    if (error || !data.user) {
      return next();
    }
    
    req.user = {
      id: data.user.id,
      email: data.user.email || '',
    };
    next();
  });
};

// GET /api/users/me - Get current user's profile
router.get('/me', extractUser, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    // Return user data from auth + profile (if exists)
    res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        profile: data || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch profile' },
    });
  }
});

// PUT /api/users/me - Update user profile
router.put('/me', extractUser, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
    }

    const { full_name, github_username, avatar_url } = req.body;

    // Upsert profile (insert if doesn't exist, update if does)
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: req.user.id,
          email: req.user.email,
          full_name: full_name || undefined,
          github_username: github_username || undefined,
          avatar_url: avatar_url || undefined,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to update profile' },
    });
  }
});

export default router;
