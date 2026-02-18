export const requireAuth = (req, res, next) => {
  const userId = req.header("x-user-id");
  
  if (!userId) {
    return res.status(401).json({ 
      success: false,
      message: "Unauthorized - No user ID provided" 
    });
  }
  
  // ✅ Attach user to request with both formats for compatibility
  req.user = { 
    id: userId,
    uid: userId
  };
  
  next();
};
