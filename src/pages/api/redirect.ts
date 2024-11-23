import { TrafficRouter } from '../../services/trafficRouter';

export default function handler(req: any, res: any) {
  const { type = 'page' } = req.query;
  
  if (!['site', 'page', 'backlinks'].includes(type)) {
    return res.status(400).json({ error: 'Invalid traffic type' });
  }

  const router = TrafficRouter.getInstance();
  const targetUrl = router.getNextUrl(type as 'site' | 'page' | 'backlinks');

  if (!targetUrl) {
    return res.status(404).json({ error: 'No active campaigns found' });
  }

  // Set cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Redirect to target URL
  res.redirect(302, targetUrl);
}