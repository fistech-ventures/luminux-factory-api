import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateGlobalConfigDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Prime TV',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'ptv',
  })
  @IsOptional()
  @IsString()
  readonly initialName?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'https://theprimetv.com/images/logo.png',
  })
  @IsOptional()
  @IsString()
  readonly icon?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'https://theprimetv.com/images/logo.png',
  })
  @IsOptional()
  @IsString()
  readonly logo?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '#161414',
  })
  @IsOptional()
  @IsString()
  readonly themePrimaryColor?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '#262525',
  })
  @IsOptional()
  @IsString()
  readonly themeSecondayColor?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '+880',
  })
  @IsOptional()
  @IsString()
  readonly phoneCode?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'BDT_৳',
  })
  @IsOptional()
  @IsString()
  readonly currency?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Stay updated with today\'s breaking news from Bangladesh covering politics, sports, business, entertainment, weather, lifestyle, education, and tourism only on leading Bangla news portal PrimeTV.',
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '8801618954713',
  })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'SK Center Ltd G. P- Ja-4, Mohakhali TB gate, Gulshan, Dhaka-1212',
  })
  @IsOptional()
  @IsString()
  readonly address?: string;

  @ApiProperty({
    type: Object,
    required: false,
    example: {
      facebook: 'https://www.facebook.com/primetv360',
      youtube: 'https://www.youtube.com/@primetv-com'
    },
  })
  @IsOptional()
  @IsObject()
  readonly socialUrls?: Record<string, string>;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly allowUserRegistration?: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly userRegistrationVerificationRequired?: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly needWebView?: boolean;

  @ApiProperty({
    type: Number,
    required: false,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  readonly otpExpiresInMin?: number;

  @IsOptional()
  updatedBy?: any;
}

export class UpdateAnalyticsConfigDTO {
  @ApiProperty({
    type: [String],
    required: false,
    example: [
      '<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-KKJT0LE43M"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag(\'js\', new Date());\n\n  gtag(\'config\', \'G-KKJT0LE43M\');\n</script>',
      '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@graph": [\n    {\n      "@type": "Organization",\n      "@id": "https://theprimetv.com/#organization",\n      "name": "The Prime TV",\n      "alternateName": "Prime Satellite TV Ltd.",\n      "url": "https://theprimetv.com/",\n      "logo": {\n        "@type": "ImageObject",\n        "url": "https://theprimetv.com/images/logo.png",\n        "width": 600,\n        "height": 60\n      },\n      "slogan": "Trusted | Timely | True",\n      "sameAs": [\n        "https://www.facebook.com/primetv360",\n        "https://www.youtube.com/@primetv-com",\n        "https://linkedin.com/company/theprimetv"\n      ],\n      "contactPoint": {\n        "@type": "ContactPoint",\n        "contactType": "customer support",\n        "telephone": "+8801618954713",\n        "email": "info@theprimetv.com"\n      }\n    }\n  ]\n}\n</script>',
      '<!-- Meta Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=\'2.0\';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,\'script\',\n\'https://connect.facebook.net/en_US/fbevents.js\');\nfbq(\'init\', \'3889524721343207\');\nfbq(\'track\', \'PageView\');\n</script>\n<noscript><img height="1" width="1" style="display:none"\nsrc="https://www.facebook.com/tr?id=3889524721343207&ev=PageView&noscript=1"\n/></noscript>\n<!-- End Meta Pixel Code -->'
    ],
    description: 'Array of tracking scripts to be injected in the website',
  })
  @IsOptional()
  readonly trackingScripts?: string[];

  @IsOptional()
  updatedBy?: any;
}
