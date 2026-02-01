# Horus Technology - Project Context

## Business Overview
- **Company:** Horus Technology
- **Location:** San Diego, CA
- **Services:** AWS Consulting, Generative AI, Intelligent Document Processing (IDP), Model Fine-Tuning, Spatial Computing
- **Target:** Local San Diego businesses + national enterprise clients
- **USP:** Team led by former AWS engineers

## Technical Stack
- **Hosting:** AWS Amplify (auto-deploys from GitHub)
- **Domain:** horustech.dev (redirects to www.horustech.dev)
- **DNS:** AWS Route 53
- **Analytics:** Google Analytics (G-8HG04N5LZF)

## AWS CLI
- **Profile:** `michael-primary`
- **Route 53 Hosted Zone ID:** `Z03034953LSG3AN9AIR8M`

---

## SEO Implementation (Feb 2025)

### Files Created
| File | Purpose |
|------|---------|
| `aws-consulting-san-diego.html` | Landing page for AWS consulting |
| `generative-ai-services.html` | Landing page for GenAI services |
| `intelligent-document-processing.html` | Landing page for IDP services |
| `sitemap.xml` | XML sitemap for Search Console |
| `robots.txt` | Search engine directives |
| `gbp-posts.md` | 10 Google Business Profile posts |
| `seo-keyword-research.md` | Keyword strategy and competitor analysis |

### Schema Markup
LocalBusiness schema added to `index.html` with:
- Business name, address, phone, email
- Service types
- Area served (San Diego, California)
- Geo coordinates
- Opening hours

### Google Search Console Setup

**Important Learnings:**

1. **Domain redirects matter:** Site redirects from `horustech.dev` to `www.horustech.dev`

2. **Sitemap submission format:** When submitting sitemap to Search Console for a domain property that redirects:
   - Use the **full URL with www**: `https://www.horustech.dev/sitemap.xml`
   - Just `sitemap.xml` doesn't work when there's a redirect

3. **DNS verification via Route 53:**
   ```bash
   aws route53 change-resource-record-sets --profile michael-primary \
     --hosted-zone-id Z03034953LSG3AN9AIR8M \
     --change-batch '{
       "Changes": [{
         "Action": "UPSERT",
         "ResourceRecordSet": {
           "Name": "horustech.dev",
           "Type": "TXT",
           "TTL": 300,
           "ResourceRecords": [{"Value": "\"google-site-verification=YOUR_CODE\""}]
         }
       }]
     }'
   ```

4. **Verify DNS propagation:**
   ```bash
   dig TXT horustech.dev +short
   ```

### Sitemap URLs
All sitemap URLs should use `www.horustech.dev` (not `horustech.dev`) since that's the canonical domain after redirect.

---

## Competitors (Local SEO)

| Company | Website | Location | Focus |
|---------|---------|----------|-------|
| Blue Tech Inc | bluetech.com | San Diego | Federal IT |
| Abalta Technologies | abaltatech.com | San Diego | IoT, mobility |
| Karini AI | karini.ai | US | GenAI platform |
| Weights & Biases | wandb.com | US | ML Developer Tools |
| C3 AI | c3.ai | US | Big data, AI, IoT |

---

## Target Keywords

### High Priority (Low Competition)
- `aws consulting san diego`
- `intelligent document processing services`
- `llm fine tuning services`
- `aws textract implementation`
- `generative ai consulting`

### Content Gaps to Exploit
1. Local San Diego industry use cases (biotech, defense)
2. IDP implementation guides
3. GenAI content for non-technical decision makers
4. AWS cost optimization guides
5. Model fine-tuning tutorials

---

## Contact Information
- **Phone:** +1 (858) 412-0778
- **Email:** info@horustech.dev
- **Proposals:** proposals@horustech.dev

---

## Git Workflow
- Main branch auto-deploys to Amplify
- Always use `www.horustech.dev` in URLs for consistency
