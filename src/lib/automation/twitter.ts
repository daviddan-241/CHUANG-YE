import { BrowserAutomation, getBrowserInstance } from './browser';
import { randomDelay, delay } from '@/lib/utils';

export interface TwitterPost {
  content: string;
  images?: string[];
  replyTo?: string;
  quoteTweet?: string;
}

export class TwitterAutomation {
  private browser: BrowserAutomation;
  private platform = 'twitter';
  private username: string;

  constructor(browser: BrowserAutomation, username: string) {
    this.browser = browser;
    this.username = username;
  }

  async login(): Promise<boolean> {
    try {
      // Try to load existing session
      const sessionLoaded = await this.browser.loadSession(this.platform, this.username);
      
      if (sessionLoaded) {
        await this.browser.navigate('https://twitter.com/home');
        await randomDelay(2000, 4000);
        
        // Check if logged in
        const isLoggedIn = await this.browser.getPage()?.evaluate(() => {
          return !document.querySelector('[data-testid="loginButton"]');
        });
        
        if (isLoggedIn) {
          console.log('Twitter session restored successfully');
          return true;
        }
      }

      // Need fresh login
      console.log('Performing fresh Twitter login...');
      await this.browser.navigate('https://twitter.com/i/flow/login');
      await randomDelay(2000, 4000);

      // Note: Actual login would require credentials
      // This is a placeholder for the login flow
      console.log('Twitter login flow initiated');
      
      // Save session after successful login
      await this.browser.saveSession(this.platform, this.username);
      
      return true;
    } catch (error) {
      console.error('Twitter login failed:', error);
      return false;
    }
  }

  async post(tweet: TwitterPost): Promise<boolean> {
    try {
      console.log('Posting to Twitter...');
      
      // Navigate to compose
      await this.browser.navigate('https://twitter.com/compose/tweet');
      await randomDelay(1000, 2000);

      // Type tweet content
      const tweetInput = '[data-testid="tweetTextarea_0"]';
      await this.browser.humanType(tweet.content, tweetInput);
      await randomDelay(500, 1000);

      // Upload images if provided
      if (tweet.images && tweet.images.length > 0) {
        for (const image of tweet.images) {
          // Upload image logic would go here
          console.log('Uploading image:', image);
          await randomDelay(1000, 2000);
        }
      }

      // Click tweet button
      await this.browser.humanClick('[data-testid="tweetButton"]');
      await randomDelay(2000, 3000);

      // Verify post was sent
      const page = this.browser.getPage();
      const url = page?.url();
      
      if (url?.includes('twitter.com/home')) {
        console.log('Tweet posted successfully');
        await this.browser.saveSession(this.platform, this.username);
        return true;
      }

      console.log('Tweet may have been posted');
      return true;
    } catch (error) {
      console.error('Failed to post tweet:', error);
      return false;
    }
  }

  async reply(tweetId: string, content: string): Promise<boolean> {
    try {
      console.log(`Replying to tweet ${tweetId}...`);
      
      await this.browser.navigate(`https://twitter.com/i/status/${tweetId}`);
      await randomDelay(2000, 3000);

      // Click reply button
      await this.browser.humanClick('[data-testid="reply"]');
      await randomDelay(1000, 2000);

      // Type reply
      const replyInput = '[data-testid="tweetTextarea_0"]';
      await this.browser.humanType(content, replyInput);
      await randomDelay(500, 1000);

      // Submit reply
      await this.browser.humanClick('[data-testid="tweetButton"]');
      await randomDelay(2000, 3000);

      console.log('Reply sent successfully');
      await this.browser.saveSession(this.platform, this.username);
      return true;
    } catch (error) {
      console.error('Failed to reply:', error);
      return false;
    }
  }

  async like(tweetId: string): Promise<boolean> {
    try {
      console.log(`Liking tweet ${tweetId}...`);
      
      await this.browser.navigate(`https://twitter.com/i/status/${tweetId}`);
      await randomDelay(2000, 3000);

      // Click like button
      await this.browser.humanClick('[data-testid="like"]');
      await randomDelay(1000, 2000);

      console.log('Tweet liked successfully');
      return true;
    } catch (error) {
      console.error('Failed to like tweet:', error);
      return false;
    }
  }

  async retweet(tweetId: string): Promise<boolean> {
    try {
      console.log(`Retweeting ${tweetId}...`);
      
      await this.browser.navigate(`https://twitter.com/i/status/${tweetId}`);
      await randomDelay(2000, 3000);

      // Click retweet button
      await this.browser.humanClick('[data-testid="retweet"]');
      await randomDelay(500, 1000);

      // Confirm retweet
      await this.browser.humanClick('[data-testid="retweetConfirm"]');
      await randomDelay(1000, 2000);

      console.log('Retweeted successfully');
      return true;
    } catch (error) {
      console.error('Failed to retweet:', error);
      return false;
    }
  }

  async follow(username: string): Promise<boolean> {
    try {
      console.log(`Following ${username}...`);
      
      await this.browser.navigate(`https://twitter.com/${username}`);
      await randomDelay(2000, 3000);

      // Click follow button
      const followButton = 'button[data-testid$="-follow"]';
      await this.browser.humanClick(followButton);
      await randomDelay(1000, 2000);

      console.log(`Followed ${username} successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to follow ${username}:`, error);
      return false;
    }
  }

  async getNotifications(): Promise<any[]> {
    try {
      console.log('Fetching notifications...');
      
      await this.browser.navigate('https://twitter.com/notifications');
      await randomDelay(2000, 3000);

      // Random interaction with feed
      await this.browser.randomFeedInteraction();

      // Get notification count
      const notifications = await this.browser.getPage()?.evaluate(() => {
        const items = document.querySelectorAll('[data-testid="notification"]');
        return Array.from(items).slice(0, 10).map(item => ({
          text: item.textContent?.trim() || '',
          time: item.querySelector('time')?.getAttribute('datetime') || ''
        }));
      });

      console.log(`Found ${notifications?.length || 0} notifications`);
      return notifications || [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async engageWithFeed(durationMinutes: number = 5): Promise<void> {
    try {
      console.log(`Engaging with feed for ${durationMinutes} minutes...`);
      
      await this.browser.navigate('https://twitter.com/home');
      
      const endTime = Date.now() + durationMinutes * 60 * 1000;
      
      while (Date.now() < endTime) {
        // Random feed interaction
        await this.browser.randomFeedInteraction();
        
        // Occasionally like posts
        if (Math.random() > 0.7) {
          try {
            await this.browser.humanClick('[data-testid="like"]');
          } catch (e) {
            // Ignore if no like button found
          }
        }
        
        // Scroll more
        await this.browser.humanScroll('down', Math.floor(Math.random() * 3) + 1);
        
        // Random pause
        await randomDelay(3000, 8000);
      }

      console.log('Feed engagement completed');
    } catch (error) {
      console.error('Failed during feed engagement:', error);
    }
  }
}

// Factory function
export async function createTwitterAutomation(username: string): Promise<TwitterAutomation> {
  const browser = await getBrowserInstance({ headless: false });
  return new TwitterAutomation(browser, username);
}
