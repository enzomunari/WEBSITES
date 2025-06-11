// components/LegalDocuments.tsx - Fixed ESLint character escaping issues
"use client"

import { X, Shield, Lock, AlertTriangle, Scale, Copyright } from 'lucide-react'

interface LegalDocumentsProps {
  termsModalOpen: boolean;
  privacyModalOpen: boolean;
  dmcaModalOpen: boolean;
  onTermsClose: () => void;
  onPrivacyClose: () => void;
  onDmcaClose: () => void;
}

export const LegalDocuments: React.FC<LegalDocumentsProps> = ({
  termsModalOpen,
  privacyModalOpen,
  dmcaModalOpen,
  onTermsClose,
  onPrivacyClose,
  onDmcaClose
}) => {
  return (
    <>
      {/* Terms of Service Modal */}
      {termsModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 text-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-slate-600 relative">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-600 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-blue-400">Terms of Service</h2>
              </div>
              <button
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
                onClick={onTermsClose}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6 text-sm leading-relaxed">
              <div className="legal-warning">
                <h4 className="font-bold text-lg mb-2 text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  CRITICAL LEGAL NOTICE
                </h4>
                <p className="text-red-200">
                  These Terms of Service constitute a legally binding agreement between you and NUDEET AI. 
                  By accessing or using this service, you acknowledge that you have read, understood, and 
                  agree to be bound by all terms and conditions herein. Violation of these terms may result 
                  in immediate account termination and potential legal action.
                </p>
              </div>

              <div className="legal-section">
                <h3>1. ACCEPTANCE OF TERMS AND ELIGIBILITY</h3>
                <p>
                  By accessing, browsing, or using the NUDEET AI Generation Studio website and services 
                  (the &ldquo;Service&rdquo;), you acknowledge that you have read, understood, and agree to be bound 
                  by these Terms of Service (&ldquo;Terms&rdquo;), our Privacy Policy, and DMCA Policy. If you do not 
                  agree to these Terms, you must immediately cease using the Service.
                </p>
                <p>
                  <strong>You must be at least 18 years of age to use our Service.</strong> By using the Service, 
                  you represent and warrant that you meet this requirement and have the legal capacity to 
                  enter into this agreement under applicable law.
                </p>
              </div>

              <div className="legal-warning">
                <h4>2. PROHIBITED CONTENT AND ZERO TOLERANCE POLICY</h4>
                <p>
                  <strong>CREATING, SHARING, OR UPLOADING AI-GENERATED CHILD SEXUAL ABUSE MATERIAL IS 
                  STRICTLY PROHIBITED, ILLEGAL, AND WILL RESULT IN IMMEDIATE ACCOUNT TERMINATION AND 
                  REPORTING TO LAW ENFORCEMENT AUTHORITIES.</strong>
                </p>
                <p>
                  We maintain a zero-tolerance policy regarding:
                </p>
                <ul>
                  <li>Any content involving minors in sexual or suggestive contexts</li>
                  <li>Child sexual abuse material (CSAM) of any kind, including AI-generated</li>
                  <li>Content that sexualizes, grooms, or exploits children</li>
                  <li>Age-regressed adult content designed to simulate minors</li>
                </ul>
                <p>
                  We employ advanced detection systems and human moderation to identify and remove such content. 
                  Violations will be reported to the National Center for Missing &amp; Exploited Children (NCMEC) 
                  and appropriate law enforcement agencies as required by 18 U.S.C. § 2258A.
                </p>
              </div>

              <div className="legal-section">
                <h3>3. DEEPFAKE PROHIBITION AND CONSENT REQUIREMENTS</h3>
                <p>
                  <strong>CREATING DEEPFAKES OF REAL PERSONS WITHOUT EXPLICIT WRITTEN CONSENT IS 
                  STRICTLY PROHIBITED AND ILLEGAL IN MANY JURISDICTIONS.</strong>
                </p>
                <p>You explicitly agree that you will NOT:</p>
                <ul>
                  <li>Upload images of any person without their explicit written consent</li>
                  <li>Create deepfake or non-consensual intimate images of real individuals</li>
                  <li>Use images of public figures, celebrities, or any identifiable person without permission</li>
                  <li>Upload images obtained without authorization (stolen, leaked, or hacked images)</li>
                  <li>Create content that could be used for harassment, blackmail, or revenge</li>
                </ul>
                <p>
                  Violations may constitute criminal offenses under various laws including but not limited to: 
                  the Violence Against Women Reauthorization Act of 2022 (US), the Online Safety Act 2023 (UK), 
                  and similar legislation worldwide. We will cooperate fully with law enforcement investigations.
                </p>
              </div>

              <div className="legal-section">
                <h3>4. INTELLECTUAL PROPERTY AND USER CONTENT</h3>
                <h4>4.1 Service Intellectual Property</h4>
                <p>
                  All intellectual property rights related to our Service, including but not limited to content, 
                  graphics, design, software, and our proprietary AI models, are owned by us or our licensors. 
                  Our Service incorporates advanced machine learning algorithms based on certain open-source models, 
                  which we have significantly refined and optimized.
                </p>
                
                <h4>4.2 User-Generated Content Rights</h4>
                <p>
                  You retain ownership rights to images and prompts you create using our Service. However, 
                  you represent and warrant that:
                </p>
                <ul>
                  <li>You have all necessary rights to submit your input content</li>
                  <li>Your content does not violate any proprietary, intellectual property, or privacy rights</li>
                  <li>You will not use our Service for any illegal or unauthorized purposes</li>
                </ul>
              </div>

              <div className="legal-section">
                <h3>5. PAYMENT TERMS AND NO REFUND POLICY</h3>
                <p>
                  <strong>ALL SALES ARE FINAL. NO REFUNDS WILL BE PROVIDED UNDER ANY CIRCUMSTANCES.</strong>
                </p>
                <p>This includes but is not limited to:</p>
                <ul>
                  <li>Dissatisfaction with generated content quality</li>
                  <li>Technical difficulties or service interruptions</li>
                  <li>Changes in personal circumstances</li>
                  <li>Misunderstanding of service capabilities</li>
                  <li>Account termination for Terms violations</li>
                </ul>
                <p>
                  Credits are non-refundable virtual currency. All payments are processed securely through 
                  third-party processors and are subject to their respective terms.
                </p>
              </div>

              <div className="legal-section">
                <h3>6. LIMITATION OF LIABILITY AND DISCLAIMERS</h3>
                <p>
                  <strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NUDEET AI SHALL NOT BE LIABLE 
                  FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</strong>
                </p>
                <p>
                  We disclaim all liability for:
                </p>
                <ul>
                  <li>User-generated content and its misuse by third parties</li>
                  <li>Accuracy or reliability of AI-generated content</li>
                  <li>Unauthorized access to or use of our servers</li>
                  <li>Service interruptions or technical malfunctions</li>
                  <li>Any criminal or tortious acts by users</li>
                </ul>
                <p>
                  Our total liability shall not exceed the amount you paid us in the twelve months preceding 
                  the claim, as established in <em>ProCD, Inc. v. Zeidenberg</em>, 86 F.3d 1447 (7th Cir. 1996).
                </p>
              </div>

              <div className="legal-section">
                <h3>7. INDEMNIFICATION</h3>
                <p>
                  You agree to defend, indemnify, and hold harmless NUDEET AI, its officers, directors, 
                  employees, agents, and affiliates from and against any claims, damages, obligations, 
                  losses, liabilities, costs, or debt, and expenses (including attorney&apos;s fees) resulting from:
                </p>
                <ul>
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Your breach of applicable laws or regulations</li>
                </ul>
              </div>

              <div className="legal-section">
                <h3>8. GOVERNING LAW AND DISPUTE RESOLUTION</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Ireland, 
                  without regard to conflict of law provisions. Any disputes shall be resolved through 
                  binding arbitration in Dublin, Ireland, in accordance with the Arbitration Rules of the 
                  Dublin International Arbitration Centre.
                </p>
                <p>
                  You waive any right to participate in class-action lawsuits or class-wide arbitration 
                  against us, as established in <em>AT&amp;T Mobility LLC v. Concepcion</em>, 563 U.S. 333 (2011).
                </p>
              </div>

              <div className="legal-section">
                <h3>9. ACCOUNT TERMINATION</h3>
                <p>
                  We reserve the right to suspend or terminate your account immediately, without notice, 
                  for any violation of these Terms or applicable law. We also maintain a policy of 
                  terminating repeat infringers at our sole discretion.
                </p>
              </div>

              <div className="legal-info">
                <h4>10. CONTACT INFORMATION</h4>
                <p>
                  For questions regarding these Terms of Service, please contact us at: 
                  <strong> nudeet.ai@proton.me</strong>
                </p>
                <p className="text-slate-400 text-xs mt-4">
                  Last Updated: {new Date().toLocaleDateString()} | Version 2.0
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {privacyModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 text-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-slate-600 relative">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-600 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-green-400">Privacy Policy</h2>
              </div>
              <button
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
                onClick={onPrivacyClose}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6 text-sm leading-relaxed">
              <div className="legal-success">
                <h4 className="font-bold text-lg mb-2 text-green-400 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  YOUR PRIVACY IS PROTECTED
                </h4>
                <p className="text-green-200">
                  This Privacy Policy explains how NUDEET AI collects, uses, protects, and handles your 
                  personal information in compliance with the General Data Protection Regulation (GDPR), 
                  California Consumer Privacy Act (CCPA), and other applicable privacy laws.
                </p>
              </div>

              <div className="legal-section">
                <h3>1. INFORMATION WE COLLECT</h3>
                <h4>1.1 Personal Information</h4>
                <p>We may collect the following categories of personal information:</p>
                <ul>
                  <li><strong>Account Information:</strong> Email address, username, payment information</li>
                  <li><strong>Usage Data:</strong> IP address, browser type, device information, access times</li>
                  <li><strong>Content Data:</strong> Images uploaded, prompts entered, generation history</li>
                  <li><strong>Communication Data:</strong> Support requests, feedback, correspondence</li>
                </ul>
                
                <h4>1.2 Legal Basis for Processing (GDPR)</h4>
                <p>We process personal data based on:</p>
                <ul>
                  <li><strong>Consent:</strong> Article 6(1)(a) GDPR for non-essential features</li>
                  <li><strong>Contract:</strong> Article 6(1)(b) GDPR for service provision</li>
                  <li><strong>Legitimate Interests:</strong> Article 6(1)(f) GDPR for security and fraud prevention</li>
                  <li><strong>Legal Obligation:</strong> Article 6(1)(c) GDPR for law enforcement cooperation</li>
                </ul>
              </div>

              <div className="legal-info">
                <h4>2. IMAGE PROCESSING AND STORAGE</h4>
                <p>
                  <strong>WE DO NOT PERMANENTLY STORE YOUR UPLOADED IMAGES.</strong>
                </p>
                <ul>
                  <li><strong>Temporary Processing:</strong> Images are processed in memory and temporary storage only</li>
                  <li><strong>Automatic Deletion:</strong> All uploaded images are automatically deleted within 24 hours</li>
                  <li><strong>Generated Content:</strong> Results are stored temporarily for your session only</li>
                  <li><strong>No Human Review:</strong> Images are processed by AI only, no human staff access</li>
                  <li><strong>Encryption:</strong> All data in transit is encrypted using TLS 1.3</li>
                </ul>
              </div>

              <div className="legal-section">
                <h3>3. DATA SHARING AND DISCLOSURE</h3>
                <p>
                  <strong>WE DO NOT SELL YOUR PERSONAL DATA.</strong> We may share information only in these circumstances:
                </p>
                <ul>
                  <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our service</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or legal process</li>
                  <li><strong>Safety and Security:</strong> To protect rights, property, or safety</li>
                  <li><strong>Business Transfers:</strong> In connection with merger, acquisition, or asset sale</li>
                </ul>
                
                <h4>3.1 International Transfers</h4>
                <p>
                  Data may be transferred to countries outside the European Economic Area with adequate 
                  protection as determined by the European Commission or under appropriate safeguards 
                  pursuant to Articles 44-49 GDPR.
                </p>
              </div>

              <div className="legal-section">
                <h3>4. DATA RETENTION</h3>
                <p>We retain personal information only as long as necessary:</p>
                <ul>
                  <li><strong>Account Data:</strong> Until account deletion or 3 years of inactivity</li>
                  <li><strong>Usage Logs:</strong> 12 months for security and legal compliance</li>
                  <li><strong>Payment Data:</strong> As required by tax and financial regulations</li>
                  <li><strong>Content Data:</strong> Immediately after session or 24 hours maximum</li>
                </ul>
              </div>

              <div className="legal-section">
                <h3>5. YOUR PRIVACY RIGHTS</h3>
                <p>Under GDPR, CCPA, and other privacy laws, you have the right to:</p>
                <ul>
                  <li><strong>Access:</strong> Request copies of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Restrict:</strong> Request restriction of processing</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
                </ul>
                <p>
                  To exercise these rights, contact us at <strong>nudeet.ai@proton.me</strong>. 
                  We will respond within 30 days as required by law.
                </p>
              </div>

              <div className="legal-section">
                <h3>6. DATA SECURITY</h3>
                <p>We implement comprehensive security measures including:</p>
                <ul>
                  <li>End-to-end encryption for all data transmission</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and employee training</li>
                  <li>Incident response and breach notification procedures</li>
                  <li>Compliance with ISO 27001 security standards</li>
                </ul>
              </div>

              <div className="legal-section">
                <h3>7. COOKIES AND TRACKING</h3>
                <p>We use only essential cookies necessary for service operation. We do not use:</p>
                <ul>
                  <li>Third-party advertising cookies</li>
                  <li>Social media tracking pixels</li>
                  <li>Cross-site tracking technologies</li>
                  <li>Analytics cookies without consent</li>
                </ul>
              </div>

              <div className="legal-section">
                <h3>8. CHILDREN&apos;S PRIVACY</h3>
                <p>
                  Our services are not intended for individuals under 18 years of age. We do not knowingly 
                  collect personal information from children under 18. If we become aware that we have 
                  collected personal information from a child, we will take steps to delete such information.
                </p>
              </div>

              <div className="legal-section">
                <h3>9. DATA BREACH NOTIFICATION</h3>
                <p>
                  In the event of a data breach affecting your personal information, we will notify you 
                  and relevant supervisory authorities within 72 hours as required by Article 33 GDPR, 
                  unless the breach is unlikely to result in a risk to your rights and freedoms.
                </p>
              </div>

              <div className="legal-info">
                <h4>10. CONTACT AND COMPLAINTS</h4>
                <p>
                  For privacy-related questions or complaints: <strong>nudeet.ai@proton.me</strong>
                </p>
                <p>
                  You have the right to lodge a complaint with your local data protection authority. 
                  For EU residents, contact details are available at: https://edpb.europa.eu/about-edpb/members_en
                </p>
                <p className="text-slate-400 text-xs mt-4">
                  Last Updated: {new Date().toLocaleDateString()} | Version 2.0
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DMCA Policy Modal */}
      {dmcaModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 text-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-600 relative">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-600 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <Copyright className="w-6 h-6 text-orange-400" />
                <h2 className="text-2xl font-bold text-orange-400">DMCA Takedown Policy</h2>
              </div>
              <button
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
                onClick={onDmcaClose}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6 text-sm leading-relaxed">
              <div className="legal-info">
                <h4 className="font-bold text-lg mb-2 text-orange-400">
                  DIGITAL MILLENNIUM COPYRIGHT ACT COMPLIANCE
                </h4>
                <p className="text-orange-200">
                  NUDEET AI respects intellectual property rights and complies with the Digital Millennium 
                  Copyright Act (17 U.S.C. § 512). This policy outlines our procedures for addressing 
                  claims of copyright infringement.
                </p>
              </div>

              <div className="legal-section">
                <h3>1. SCOPE OF POLICY</h3>
                <p>
                  This DMCA policy applies to all users of NUDEET AI and covers all content generated, 
                  uploaded, and shared on our platform. We prohibit the creation of images featuring 
                  real individuals without consent and take proactive steps to remove infringing content.
                </p>
                <p>
                  However, given our platform&apos;s nature, we rely on copyright holders and their authorized 
                  agents to report instances of infringement pursuant to 17 U.S.C. § 512(c)(3).
                </p>
              </div>

              <div className="legal-section">
                <h3>2. REPORTING COPYRIGHT INFRINGEMENT</h3>
                <p>
                  If you believe that your copyrighted work has been reproduced on our platform in a way 
                  that constitutes copyright infringement, please provide us with a written notice containing 
                  the following information as required by 17 U.S.C. § 512(c)(3)(A):
                </p>
                <ul>
                  <li>
                    <strong>Signature:</strong> A physical or electronic signature of the person authorized 
                    to act on behalf of the copyright owner
                  </li>
                  <li>
                    <strong>Work Description:</strong> A description of the copyrighted work that you claim 
                    has been infringed, including registration number if applicable
                  </li>
                  <li>
                    <strong>Location:</strong> A description of where the infringing material is located on 
                    our site, preferably with direct URLs to the specific content
                  </li>
                  <li>
                    <strong>Contact Information:</strong> Your address, telephone number, and email address
                  </li>
                  <li>
                    <strong>Good Faith Statement:</strong> A statement that you have a good faith belief that 
                    the disputed use is not authorized by the copyright owner, its agent, or the law
                  </li>
                  <li>
                    <strong>Accuracy Statement:</strong> A statement made under penalty of perjury that the 
                    above information is accurate and that you are the copyright owner or authorized to act 
                    on behalf of the copyright owner
                  </li>
                </ul>
                <p>
                  <strong>Send DMCA notices to our designated Copyright Agent:</strong>
                  <br />
                  Email: <strong>nudeet.ai@proton.me</strong>
                  <br />
                  Subject Line: &ldquo;DMCA Takedown Notice&rdquo;
                </p>
              </div>

              <div className="legal-section">
                <h3>3. TAKEDOWN PROCESS</h3>
                <p>Upon receipt of a valid DMCA infringement notice, NUDEET AI will promptly:</p>
                <ol>
                  <li>
                    <strong>Remove or Disable Access:</strong> Remove or disable access to the allegedly 
                    infringing material as required by 17 U.S.C. § 512(c)(1)(C)
                  </li>
                  <li>
                    <strong>Notify User:</strong> Notify the user who posted the material, providing them 
                    with the infringement notice and information about the counter-notification process 
                    pursuant to 17 U.S.C. § 512(g)(2)
                  </li>
                  <li>
                    <strong>Document:</strong> Maintain records of the takedown notice and our response 
                    as required for safe harbor protection
                  </li>
                </ol>
                <p>
                  We will process valid DMCA notices within 24-48 hours of receipt during business days.
                </p>
              </div>

              <div className="legal-section">
                <h3>4. COUNTER-NOTIFICATION PROCESS</h3>
                <p>
                  If you believe your content was wrongly removed due to mistake or misidentification, 
                  you may submit a counter-notification under 17 U.S.C. § 512(g)(3) containing:
                </p>
                <ul>
                  <li>Your physical or electronic signature</li>
                  <li>
                    A description of the content that was removed and the location where it previously appeared
                  </li>
                  <li>
                    A statement under penalty of perjury that you believe the content was removed as a result 
                    of mistake or misidentification of the material
                  </li>
                  <li>
                    Your name, address, and telephone number, and a statement that you consent to the 
                    jurisdiction of the Federal District Court for the judicial district in which your 
                    address is located (or for any judicial district in which NUDEET AI may be found if 
                    outside the United States)
                  </li>
                  <li>
                    A statement that you will accept service of process from the person who provided the 
                    original infringement notification or an agent of such person
                  </li>
                </ul>
                <p>
                  Send counter-notifications to: <strong>nudeet.ai@proton.me</strong> with subject line 
                  &ldquo;DMCA Counter-Notification&rdquo;
                </p>
              </div>

              <div className="legal-section">
                <h3>5. RESTORATION PROCESS</h3>
                <p>
                  Upon receipt of a valid counter-notification, we will:
                </p>
                <ul>
                  <li>Forward the counter-notification to the original complainant</li>
                  <li>
                    Restore the content within 10-14 business days unless we receive notice that the 
                    complainant has filed a court action seeking to restrain the allegedly infringing activity
                  </li>
                  <li>Notify all parties of the restoration</li>
                </ul>
              </div>

              <div className="legal-warning">
                <h4>6. REPEAT INFRINGER POLICY</h4>
                <p>
                  In accordance with 17 U.S.C. § 512(i)(1)(A), NUDEET AI maintains a policy of terminating 
                  the accounts of users who are repeat infringers. We may terminate accounts after receiving 
                  multiple valid DMCA notices or based on other evidence of repeated copyright infringement.
                </p>
                <p>
                  <strong>Repeat infringers will be permanently banned from our platform and may face 
                  legal action for copyright infringement.</strong>
                </p>
              </div>

              <div className="legal-section">
                <h3>7. FALSE CLAIMS AND PENALTIES</h3>
                <p>
                  <strong>Warning:</strong> Submitting a false DMCA notice or counter-notification may result 
                  in liability for damages, including costs and attorney&apos;s fees, under 17 U.S.C. § 512(f). 
                  False claims may also constitute perjury under federal law.
                </p>
                <p>
                  Before submitting a DMCA notice, please ensure that:
                </p>
                <ul>
                  <li>You own the copyright or are authorized to act on behalf of the owner</li>
                  <li>The use is not authorized by copyright law (e.g., fair use)</li>
                  <li>Your complaint is made in good faith</li>
                </ul>
              </div>

              <div className="legal-info">
                <h4>8. CONTACT INFORMATION</h4>
                <p>
                  <strong>Designated Copyright Agent:</strong>
                  <br />
                  NUDEET AI Legal Department
                  <br />
                  Email: nudeet.ai@proton.me
                  <br />
                  Subject: DMCA Notice/Counter-Notification
                </p>
                <p>
                  For questions about this DMCA policy: <strong>nudeet.ai@proton.me</strong>
                </p>
                <p className="text-slate-400 text-xs mt-4">
                  Effective Date: {new Date().toLocaleDateString()} | Version 1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};