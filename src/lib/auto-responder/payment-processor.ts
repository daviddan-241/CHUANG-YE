import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface PaymentConfig {
  products: Product[];
  wechatQrPath: string;
  usdtWalletAddress: string;
  autoConfirm: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  currency: 'CNY' | 'USD';
  description: string;
  deliveryFile: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'starter-pack',
    name: 'Starter Pack',
    price: 299,
    currency: 'CNY',
    description: 'Complete supplier list, scripts, and video tutorials',
    deliveryFile: '/deliverables/starter-pack.zip'
  },
  {
    id: 'pro-pack',
    name: 'Pro Pack',
    price: 49,
    currency: 'USD',
    description: 'Advanced strategies, 1-on-1 consultation, lifetime updates',
    deliveryFile: '/deliverables/pro-pack.zip'
  },
  {
    id: 'premium-pack',
    name: 'Premium Pack',
    price: 599,
    currency: 'CNY',
    description: 'Everything + private community access + weekly coaching',
    deliveryFile: '/deliverables/premium-pack.zip'
  }
];

const PAYMENT_KEYWORDS = [
  'buy', 'purchase', 'pay', 'order', 'get it',
  '怎么买', '怎么付款', '想买', '购买', '下单', '付款',
  'how to buy', 'how to pay', 'want to buy', 'take my money'
];

const PAYMENT_MESSAGES = {
  wechat: "Great choice! 🎉\n\nTo complete your purchase:\n\n1. Scan the QR code below (WeChat Pay)\n2. Send ¥{amount} for {product}\n3. Send me the payment screenshot\n\nI'll deliver your pack immediately after verification! 💰",
  
  usdt: "Perfect! 🎉\n\nTo complete your purchase:\n\n1. Send {amount} USDT to this wallet:\n{wallet}\n2. Send me the transaction hash\n\nYour pack will be delivered within 5 minutes! 💰",
  
  chinese_wechat: "太棒了！🎉\n\n购买流程：\n1. 扫描下方二维码（微信支付）\n2. 支付 ¥{amount} 购买 {product}\n3. 发送付款截图给我\n\n验证后立即发货！💰",
  
  chinese_usdt: "好的！🎉\n\n购买流程：\n1. 发送 {amount} USDT 到这个钱包：\n{wallet}\n2. 发送交易哈希给我\n\n5分钟内发货！💰"
};

export class PaymentProcessor {
  private config: PaymentConfig;

  constructor(config: Partial<PaymentConfig> = {}) {
    this.config = {
      products: DEFAULT_PRODUCTS,
      wechatQrPath: '/payment/qr-wechat.png',
      usdtWalletAddress: 'TRC20_WALLET_ADDRESS_HERE',
      autoConfirm: false,
      ...config
    };
  }

  async processPaymentRequest(dm: any): Promise<void> {
    console.log(`💰 Processing payment request from ${dm.userHandle}...`);
    
    // Determine product based on message context
    const product = this.selectProduct(dm.message);
    
    // Generate payment message
    const isChinese = /[\u4e00-\u9fff]/.test(dm.message);
    const useUsdt = dm.message.toLowerCase().includes('usdt') || dm.message.toLowerCase().includes('crypto');
    
    let paymentMessage: string;
    
    if (useUsdt) {
      const template = isChinese ? PAYMENT_MESSAGES.chinese_usdt : PAYMENT_MESSAGES.usdt;
      paymentMessage = template
        .replace('{amount}', product.currency === 'USD' ? `$${product.price}` : `${product.price} USDT`)
        .replace('{wallet}', this.config.usdtWalletAddress)
        .replace('{product}', product.name);
    } else {
      const template = isChinese ? PAYMENT_MESSAGES.chinese_wechat : PAYMENT_MESSAGES.wechat;
      paymentMessage = template
        .replace('{amount}', product.price.toString())
        .replace('{product}', product.name);
    }
    
    // Send payment instructions
    await this.sendPaymentMessage(dm, paymentMessage);
    
    // If using WeChat, also send QR code
    if (!useUsdt) {
      await this.sendQRCode(dm);
    }
    
    // Save to database
    await prisma.conversion.create({
      data: {
        brandId: dm.brandId,
        platform: dm.platform,
        userHandle: dm.userHandle,
        amount: product.price,
        currency: product.currency,
        status: 'pending',
        paymentMethod: useUsdt ? 'usdt' : 'wechat',
        notes: `Product: ${product.name}`
      }
    });
    
    console.log(`  ✅ Payment instructions sent for ${product.name}`);
  }

  private selectProduct(message: string): Product {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific product mentions
    if (lowerMessage.includes('pro') || lowerMessage.includes('advanced') || lowerMessage.includes('高级')) {
      return this.config.products.find(p => p.id === 'pro-pack') || this.config.products[0];
    }
    
    if (lowerMessage.includes('premium') || lowerMessage.includes('premium') || lowerMessage.includes('尊享')) {
      return this.config.products.find(p => p.id === 'premium-pack') || this.config.products[0];
    }
    
    // Default to starter pack
    return this.config.products.find(p => p.id === 'starter-pack') || this.config.products[0];
  }

  private async sendPaymentMessage(dm: any, message: string): Promise<void> {
    console.log(`  📤 Sending payment message to ${dm.userHandle}...`);
    
    // In real implementation, this would use the DM trigger to send the message
    // For now, we'll log it
    console.log(`  Message: ${message.substring(0, 100)}...`);
  }

  private async sendQRCode(dm: any): Promise<void> {
    console.log(`  📱 Sending WeChat QR code...`);
    
    // In real implementation, this would send the QR code image
    // via the platform's media upload feature
  }

  async confirmPayment(conversionId: string): Promise<void> {
    console.log(`✅ Confirming payment: ${conversionId}`);
    
    // Update conversion status
    const conversion = await prisma.conversion.update({
      where: { id: conversionId },
      data: {
        status: 'confirmed',
        updatedAt: new Date()
      }
    });
    
    // Deliver the product
    await this.deliverProduct(conversion);
    
    console.log(`  ✅ Payment confirmed and product delivered`);
  }

  private async deliverProduct(conversion: any): Promise<void> {
    console.log(`  📦 Delivering product to ${conversion.userHandle}...`);
    
    const product = this.config.products.find(p => 
      conversion.notes?.includes(p.id)
    ) || this.config.products[0];
    
    // Send delivery message
    const deliveryMessage = `🎉 Payment confirmed!\n\nHere's your ${product.name}:\n\n${product.description}\n\nDownload link: [Download your pack]\n\nThank you for your purchase! If you have any questions, feel free to ask. 🙏`;
    
    // Send via DM
    await this.sendDeliveryMessage(conversion, deliveryMessage);
    
    // Update status
    await prisma.conversion.update({
      where: { id: conversion.id },
      data: {
        status: 'delivered',
        updatedAt: new Date()
      }
    });
    
    // Log DM
    await prisma.dM.updateMany({
      where: {
        brandId: conversion.brandId,
        platform: conversion.platform,
        userHandle: conversion.userHandle
      },
      data: {
        status: 'converted'
      }
    });
  }

  private async sendDeliveryMessage(conversion: any, message: string): Promise<void> {
    console.log(`  📤 Sending delivery message...`);
    
    // In real implementation, this would:
    // 1. Send the message via DM
    // 2. Attach the ZIP file
    // 3. Log the delivery
  }

  isPaymentRequest(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim();
    return PAYMENT_KEYWORDS.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
  }

  async getConversionStats(brandId: string): Promise<any> {
    const total = await prisma.conversion.count({
      where: { brandId }
    });
    
    const confirmed = await prisma.conversion.count({
      where: { brandId, status: 'confirmed' }
    });
    
    const delivered = await prisma.conversion.count({
      where: { brandId, status: 'delivered' }
    });
    
    const totalRevenue = await prisma.conversion.aggregate({
      where: { brandId, status: { in: ['confirmed', 'delivered'] } },
      _sum: { amount: true }
    });
    
    return {
      total,
      confirmed,
      delivered,
      pending: total - confirmed - delivered,
      totalRevenue: totalRevenue._sum.amount || 0
    };
  }
}

// Singleton instance
let paymentProcessorInstance: PaymentProcessor | null = null;

export function getPaymentProcessor(config?: Partial<PaymentConfig>): PaymentProcessor {
  if (!paymentProcessorInstance) {
    paymentProcessorInstance = new PaymentProcessor(config);
  }
  return paymentProcessorInstance;
}

export async function handlePaymentRequest(dm: any): Promise<void> {
  const processor = getPaymentProcessor();
  await processor.processPaymentRequest(dm);
}
