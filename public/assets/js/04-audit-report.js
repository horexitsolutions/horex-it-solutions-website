(function(){
/* ===== Dynamic audit report: score engine + bilingual renderer ===== */
const R = {
 banner:['Thank you, {name}! We are running your free audit for {biz}. We will email your report to {email}. Nothing goes live without your OK.','धन्यवाद, {name}! हम {biz} के लिए आपका फ्री ऑडिट चला रहे हैं। हम आपकी रिपोर्ट {email} पर भेजेंगे। आपकी मंज़ूरी के बिना कुछ भी लाइव नहीं होता।'],
 kicker:['FREE BUSINESS AUDIT REPORT','फ्री बिज़नेस ऑडिट रिपोर्ट'],live:['Live Audit Data','लाइव ऑडिट डेटा'],sample:['Sample data','सैंपल डेटा'],
 st_nf:['Not final yet','अभी फ़ाइनल नहीं'],st_nfs:['Full audit needs your Google listing.','बिना आपकी गूगल लिस्टिंग के पूरा ऑडिट नहीं हो सकता।'],
 st_start:['Just getting started','अभी शुरुआत है'],st_passive:['Present but passive','मौजूद है पर निष्क्रिय'],st_strong:['Strong base','मज़बूत शुरुआत'],
 note:['Scored for what matters to a {type} business in {city}. Most of your missing points sit in {a} and {b}.','यह स्कोर उन बातों के हिसाब से है जो {city} में आपके {type} बिज़नेस के लिए मायने रखती हैं। आपके ज़्यादातर अंक {a} और {b} में कटे हैं।'],
 keyl:['KEY INSIGHT','मुख्य बात'],
 ins_head:['Your audit score of {score} points to gaps in how customers can find and contact you.','आपका ऑडिट स्कोर {score} बताता है कि ग्राहकों को आपको ढूँढने और आपसे संपर्क करने में कमियाँ हैं।'],
 ins_nosite:['You have no website yet.','आपकी अभी कोई वेबसाइट नहीं है।'],ins_maps:['We couldn’t confirm a Google Maps listing for your business.','हम आपके बिज़नेस की Google मैप लिस्टिंग की पुष्टि नहीं कर सके।'],
 ins_enq:['You get very few enquiries each month.','आपको हर महीने बहुत कम पूछताछ मिलती हैं।'],ins_social:['We found no Instagram or Facebook page.','हमें कोई इंस्टाग्राम या फेसबुक पेज नहीं मिला।'],
 ins_good:['The good news: every gap below can be fixed step by step.','अच्छी बात: नीचे की हर कमी कदम-दर-कदम ठीक हो सकती है।'],
 s_fix:['Fix this first','सबसे पहले यह ठीक करें'],
 f_nosite_t:['Get a website for your business','अपने बिज़नेस के लिए वेबसाइट बनवाइए'],f_nosite_b:['You told us you have no website. Customers who cannot find you online often choose someone else.','आपने बताया कि आपकी वेबसाइट नहीं है। जो ग्राहक आपको ऑनलाइन नहीं ढूँढ पाते, वे अक्सर किसी और को चुन लेते हैं।'],
 f_maps_t:['Google Maps listing','Google मैप लिस्टिंग'],f_maps_b:['We couldn’t confirm a Google Maps listing for your business.','हम आपके बिज़नेस की Google मैप लिस्टिंग की पुष्टि नहीं कर सके।'],
 f_enq_t:['Add a clear way to enquire on your pages','अपने पेजों पर पूछताछ का साफ़ तरीका जोड़िए'],f_enq_b:['If a customer likes what they see but can’t easily ask a question or reach you, they may leave.','अगर ग्राहक को आपका काम पसंद आए लेकिन वह आसानी से सवाल नहीं पूछ पाए या आप तक नहीं पहुँच पाए, तो वह चला जा सकता है।'],
 f_soc_t:['Start your social media pages','अपने सोशल मीडिया पेज शुरू कीजिए'],f_soc_b:['We found no Instagram or Facebook page in your answers. Customers like to check them before they call.','आपके जवाबों में हमें कोई इंस्टाग्राम या फेसबुक पेज नहीं मिला। ग्राहक कॉल करने से पहले उन्हें देखना पसंद करते हैं।'],
 f_sal_t:['Turn your sales around','अपनी बिक्री को पटरी पर लाइए'],f_sal_b:['Your sales have been falling. Find the biggest gap and fix it first.','आपकी बिक्री घट रही है। सबसे बड़ी कमी ढूँढिए और पहले उसे ठीक कीजिए।'],
 f_rev_t:['Ask for more reviews','और रिव्यू माँगिए'],f_rev_b:['Ask every happy customer for a Google review. It builds trust fast.','हर खुश ग्राहक से Google रिव्यू माँगिए। इससे भरोसा जल्दी बनता है।'],
 s_break:['Score breakdown','स्कोर का ब्योरा'],b_web:['Website Quality','वेबसाइट क्वालिटी'],b_ready:['Business Readiness','बिज़नेस की तैयारी'],b_found:['Found Online','ऑनलाइन मौजूदगी'],
 bw_none:['You do not have a website yet, so this score is 0.','आपकी अभी वेबसाइट नहीं है, इसलिए यह स्कोर 0 है।'],bw_low:['Your website needs work: how fast, secure, clear and easy to find it is.','आपकी वेबसाइट पर काम चाहिए: वह कितनी तेज़, सुरक्षित, साफ़ और आसानी से मिलने वाली है।'],bw_ok:['Your website is a good base. Keep it fast, safe and clear.','आपकी वेबसाइट एक अच्छी शुरुआत है। उसे तेज़, सुरक्षित और साफ़ रखिए।'],
 br_low:['Your business is not ready to turn visitors into customers yet: payments, orders, enquiries, reviews.','आपका बिज़नेस अभी विज़िटर को ग्राहक बनाने के लिए तैयार नहीं है: भुगतान, ऑर्डर, पूछताछ, रिव्यू।'],br_ok:['Your business is getting ready to turn visitors into customers.','आपका बिज़नेस विज़िटर को ग्राहक बनाने के लिए तैयार हो रहा है।'],
 bf_low:['Customers have a hard time finding you on Google and social media.','ग्राहकों को आपको Google और सोशल मीडिया पर ढूँढने में मुश्किल होती है।'],bf_ok:['Customers can find you on Google and social media.','ग्राहक आपको Google और सोशल मीडिया पर ढूँढ सकते हैं।'],
 s_first:['Do these 3 first','ये 3 काम सबसे पहले करें'],worth:['Worth up to +{n} on your score','आपके स्कोर में +{n} तक'],
 s_plan:['Your first week of posts','आपके पहले हफ़्ते की पोस्ट'],plan_sub:['A 7-day social media plan made for {biz}.','{biz} के लिए बना 7 दिन का सोशल मीडिया प्लान।'],day:['Day {n}','दिन {n}'],photo:['Photo idea','फ़ोटो आइडिया'],
 d1t:['Hello from {biz}, {city}','{biz}, {city} से नमस्ते'],d1c:['Namaste! {biz} is now online in {city}. Follow along for useful tips and updates.','नमस्ते! {biz} अब {city} में ऑनलाइन है। काम की टिप्स और अपडेट के लिए जुड़े रहिए।'],d1p:['Your logo, or a smiling photo of you at work.','आपका लोगो, या काम करते हुए आपकी मुस्कुराती फ़ोटो।'],
 d2t:['Meet the person behind {biz}','{biz} के पीछे के इंसान से मिलिए'],d2c:['Hi, I’m the person behind {biz}. Here is why I started and who I help.','नमस्ते, मैं {biz} के पीछे का इंसान हूँ। जानिए मैंने इसे क्यों शुरू किया और मैं किसकी मदद करता हूँ।'],d2p:['A simple, clear portrait of you.','आपकी एक सादी, साफ़ फ़ोटो।'],
 d3t:['A peek at my workspace','मेरे वर्कस्पेस की एक झलक'],d3c:['This is where the work happens every day.','यहीं रोज़ सारा काम होता है।'],d3p:['Your desk, laptop or office corner.','आपकी डेस्क, लैपटॉप या ऑफ़िस का कोना।'],
 d4t:['One question to ask yourself','खुद से पूछने लायक एक सवाल'],d4c:['If a customer wanted to reach you today, how easy would it be? Tell us in the comments.','अगर कोई ग्राहक आज आप तक पहुँचना चाहे, तो यह कितना आसान होगा? कमेंट में बताइए।'],d4p:['A plain text card with the question.','सवाल लिखा एक सादा टेक्स्ट कार्ड।'],
 d5t:['Bring your questions along','अपने सवाल साथ लाइए'],d5c:['Ask me anything about {type}. I will answer the best ones this week.','{type} के बारे में कुछ भी पूछिए। इस हफ़्ते मैं सबसे अच्छे सवालों के जवाब दूँगा।'],d5p:['A question-box style graphic.','सवाल-बॉक्स जैसा ग्राफ़िक।'],
 d6t:['Proudly working from {city}','गर्व से {city} से काम कर रहे हैं'],d6c:['Proud to serve our neighbours in {city}. Thank you for being part of our community.','{city} में अपने पड़ोसियों की सेवा करने पर गर्व है। हमारे समुदाय का हिस्सा बनने के लिए धन्यवाद।'],d6p:['A well-known place or street in your city.','आपके शहर की कोई जानी-पहचानी जगह या सड़क।'],
 d7t:['Thank you for week one','पहले हफ़्ते के लिए धन्यवाद'],d7c:['Thank you for following {biz}. More tips are coming next week.','{biz} से जुड़ने के लिए धन्यवाद। अगले हफ़्ते और टिप्स आएंगी।'],d7p:['Selfie video prompt: say thank you in a 15-second selfie video.','सेल्फ़ी वीडियो आइडिया: 15 सेकंड के सेल्फ़ी वीडियो में धन्यवाद कहिए।'],
 s_loss:['Where you’re losing marks','आप कहाँ अंक खो रहे हैं'],why:['WHY MARKS WERE CUT','अंक क्यों कटे'],how:['HOW TO FIX IT','कैसे ठीक करें'],
 c_web:['Website','वेबसाइट'],c_maps:['Google map listing','Google मैप लिस्टिंग'],c_enq:['Enquiries and leads','पूछताछ और लीड'],c_sales:['Business results (you told us)','बिज़नेस के नतीजे (आपने बताया)'],c_pay:['Payments','भुगतान'],c_social:['Social media pages','सोशल मीडिया पेज'],
 w0_w:['You told us you do not have a website yet. Customers cannot find or trust a business they cannot see online.','आपने बताया कि आपकी अभी वेबसाइट नहीं है। जो बिज़नेस ऑनलाइन दिखता नहीं, ग्राहक उसे ढूँढ या उस पर भरोसा नहीं कर पाते।'],w0_f:['Build a fast, clean website with your services, phone number and a WhatsApp button.','अपनी सेवाओं, फ़ोन नंबर और WhatsApp बटन के साथ एक तेज़, साफ़ वेबसाइट बनवाइए।'],
 w1_w:['You have a website, which is a good start. Speed, safety and clear contact buttons decide how many visitors send an enquiry.','आपकी वेबसाइट है, यह अच्छी शुरुआत है। स्पीड, सुरक्षा और साफ़ संपर्क बटन तय करते हैं कि कितने विज़िटर पूछताछ भेजते हैं।'],w1_f:['Make sure it loads fast on phones, uses https, and has a call and WhatsApp button on every page.','पक्का कीजिए कि वह फ़ोन पर तेज़ खुले, https इस्तेमाल करे, और हर पेज पर कॉल और WhatsApp बटन हो।'],
 m1_w:['You told us you have a Google Maps listing. Good!','आपने बताया कि Google मैप पर आपकी लिस्टिंग है। बढ़िया!'],m1_f:['Keep your photos, opening hours and reviews fresh.','अपनी फ़ोटो, खुलने का समय और रिव्यू नए रखिए।'],
 m0_w:['You told us you have no Google Maps listing, so nearby customers cannot find you there.','आपने बताया कि Google मैप पर आपकी लिस्टिंग नहीं है, इसलिए आसपास के ग्राहक आपको वहाँ नहीं ढूँढ पाते।'],m2_w:['You are not sure you have a listing, and we couldn’t confirm one for your business.','आप पक्का नहीं हैं कि आपकी लिस्टिंग है, और हम भी आपके बिज़नेस की लिस्टिंग की पुष्टि नहीं कर सके।'],m_f:['Create or claim your Google Business Profile.','अपनी Google Business Profile बनाइए या क्लेम कीजिए।'],
 e_w:['You told us you get {n} enquiries a month.','आपने बताया कि आपको हर महीने {n} पूछताछ मिलती हैं।'],e_fl:['Add a clear way to enquire on every page: a call button, a WhatsApp link and a short form connected to your email or phone.','हर पेज पर पूछताछ का साफ़ तरीका जोड़िए: कॉल बटन, WhatsApp लिंक और आपके ईमेल या फ़ोन से जुड़ा एक छोटा फ़ॉर्म।'],e_fh:['Reply fast to every enquiry. An automatic first reply keeps more of them.','हर पूछताछ का जल्दी जवाब दीजिए। पहला जवाब अपने आप चला जाए तो ज़्यादा लोग टिकते हैं।'],
 sa1_w:['Your sales have been growing. Great!','आपकी बिक्री बढ़ रही है। बहुत बढ़िया!'],sa1_f:['Write down what is working, and do more of it.','लिख लीजिए कि क्या काम कर रहा है, और उसे और कीजिए।'],
 sa2_w:['Your sales have been flat for the last 3 months.','पिछले 3 महीनों से आपकी बिक्री स्थिर है।'],sa2_f:['Try one new way to reach customers each month, like Google Maps or a social media offer.','हर महीने ग्राहकों तक पहुँचने का एक नया तरीका आज़माइए, जैसे Google मैप या सोशल मीडिया ऑफ़र।'],
 sa3_w:['Your sales have been falling for the last 3 months.','पिछले 3 महीनों से आपकी बिक्री घट रही है।'],sa3_f:['Find out where customers drop off, and fix the biggest gap first.','पता कीजिए ग्राहक कहाँ छूट जाते हैं, और सबसे बड़ी कमी पहले ठीक कीजिए।'],
 sa4_w:['You have just started, so there is little sales history yet.','आपने अभी शुरू किया है, इसलिए बिक्री का इतिहास अभी कम है।'],sa4_f:['Get found first: a Google Maps listing, a simple website and a few reviews.','पहले मिलना शुरू कीजिए: Google मैप लिस्टिंग, एक सरल वेबसाइट और कुछ रिव्यू।'],
 p_w:['You told us customers pay by: {list}.','आपने बताया कि ग्राहक इन तरीकों से भुगतान करते हैं: {list}।'],p_fn:['Add UPI or QR so customers can pay in seconds.','UPI या QR जोड़िए ताकि ग्राहक सेकंडों में भुगतान कर सकें।'],p_fm:['Add one more easy way to pay, like online payment on your website.','भुगतान का एक और आसान तरीका जोड़िए, जैसे वेबसाइट पर ऑनलाइन भुगतान।'],p_fo:['Your payment options look good. Keep them easy to find.','आपके भुगतान विकल्प अच्छे हैं। उन्हें आसानी से दिखने लायक रखिए।'],
 so0_w:['We found no Instagram or Facebook page in your answers.','आपके जवाबों में हमें कोई इंस्टाग्राम या फेसबुक पेज नहीं मिला।'],so0_f:['Create a free Instagram and Facebook page, and post a few times a week. Use your 7-day plan above.','एक फ्री इंस्टाग्राम और फेसबुक पेज बनाइए, और हफ़्ते में कुछ बार पोस्ट कीजिए। ऊपर दिया 7 दिन का प्लान इस्तेमाल कीजिए।'],
 so1_w:['You have only one social page.','आपका सिर्फ़ एक सोशल पेज है।'],so1_f:['Add the other page and share the same updates on both.','दूसरा पेज भी जोड़िए और दोनों पर वही अपडेट डालिए।'],so2_w:['You have both an Instagram and a Facebook page.','आपके पास इंस्टाग्राम और फेसबुक दोनों पेज हैं।'],so2_f:['Post regularly and reply to every message.','नियमित पोस्ट कीजिए और हर मैसेज का जवाब दीजिए।'],
 s_comp:['Competitor benchmark in {city} (sample)','{city} में प्रतिस्पर्धियों से तुलना (सैंपल)'],comp_note:['These are example {type} businesses in {city}, with scores set close to yours for a fair gap. Your full report compares you with real businesses near you on Google.','ये {city} के उदाहरण {type} बिज़नेस हैं, जिनके स्कोर आपके स्कोर के आसपास रखे गए हैं ताकि तुलना सही लगे। आपकी पूरी रिपोर्ट आपकी तुलना Google पर आपके आसपास के असली बिज़नेस से करती है।'],comp_tag:['Example competitor in {city}','{city} में उदाहरण प्रतिस्पर्धी'],
 th_b:['Business','बिज़नेस'],th_s:['Score','स्कोर'],you_row:['{biz} (You)','{biz} (आप)'],you:['YOU','आप'],cA:['Competitor A','प्रतिस्पर्धी A'],cB:['Competitor B','प्रतिस्पर्धी B'],cC:['Competitor C','प्रतिस्पर्धी C'],
 cta_h:['Ready to fix these gaps?','क्या इन कमियों को ठीक करने के लिए तैयार हैं?'],cta_s:['We can set it up for you. You see a clear written price first, and work starts only after you say yes.','हम आपके लिए यह सेटअप कर सकते हैं। पहले आपको साफ़ लिखित कीमत मिलती है, और काम आपकी हाँ के बाद ही शुरू होता है।'],
 cta_c:['Need help now? Call or WhatsApp','अभी मदद चाहिए? कॉल या WhatsApp करें'],cta_1:['Google Business Profile setup & verification help','Google Business Profile सेटअप और वेरिफ़िकेशन में मदद'],cta_2:['Get a quote','कोट पाएं']
};
const fmt = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => v && k in v ? v[k] : m);
const isHi = () => window.LANG === 'hi';
const r = (k, v) => fmt(R[k][isHi() ? 1 : 0], v);
const tr = s => (isHi() && typeof HI !== 'undefined' && HI[s]) ? HI[s] : s;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const COMP = {
 'Startup / D2C brand':[['Nova Labs','नोवा लैब्स'],['Bloom & Co','ब्लूम एंड को'],['Urban Cart','अर्बन कार्ट']],
 'Clinic / healthcare':[['Apex Care Clinic','एपेक्स केयर क्लिनिक'],['City Health Centre','सिटी हेल्थ सेंटर'],['Sunrise Wellness Clinic','सनराइज़ वेलनेस क्लिनिक']],
 'Coaching / education':[['Apex Academy','एपेक्स एकेडमी'],['Global Learning Hub','ग्लोबल लर्निंग हब'],['Bright Future Classes','ब्राइट फ्यूचर क्लासेस']],
 'Real estate':[['Prime Properties','प्राइम प्रॉपर्टीज़'],['Shree Homes','श्री होम्स'],['Landmark Realty','लैंडमार्क रियल्टी']],
 'Manufacturer':[['Precision Works','प्रिसिज़न वर्क्स'],['Shakti Industries','शक्ति इंडस्ट्रीज़'],['Metro Fabricators','मेट्रो फैब्रिकेटर्स']],
 'Services firm':[['Trusted Services Co.','ट्रस्टेड सर्विसेज़ कंपनी'],['Smart Solutions','स्मार्ट सॉल्यूशंस'],['Pioneer Associates','पायनियर एसोसिएट्स']],
 'Restaurant / cafe':[['Spice Garden','स्पाइस गार्डन'],['The Tandoor House','द तंदूर हाउस'],['Cafe Brew Point','कैफे ब्रू पॉइंट']],
 'Shop / retail':[['City Mart','सिटी मार्ट'],['Royal Bazaar','रॉयल बाज़ार'],['Value Store','वैल्यू स्टोर']],
 'Gym or fitness studio':[['Iron Pulse Gym','आयरन पल्स जिम'],['Fit Nation','फिट नेशन'],['Zen Fitness Studio','ज़ेन फिटनेस स्टूडियो']],
 'Boutique or clothing store':[['Rang Boutique','रंग बुटीक'],['Style Street','स्टाइल स्ट्रीट'],['Royal Threads','रॉयल थ्रेड्स']],
 'Salon or spa':[['Glow Salon','ग्लो सैलून'],['Serenity Spa','सेरेनिटी स्पा'],['Style Studio','स्टाइल स्टूडियो']],
 'Hotel or resort':[['Grand Palace Hotel','ग्रैंड पैलेस होटल'],['Heritage Stay','हेरिटेज स्टे'],['Lakeview Resort','लेकव्यू रिज़ॉर्ट']],
 'Coach or consultant':[['Growth Mentors','ग्रोथ मेंटर्स'],['Insight Advisors','इनसाइट एडवाइज़र्स'],['Peak Performance Coaching','पीक परफॉर्मेंस कोचिंग']],
 'Other':[['Local Leader Co.','लोकल लीडर कंपनी'],['City Pro Services','सिटी प्रो सर्विसेज़'],['Trusted Choice','ट्रस्टेड चॉइस']]
};
const SAMPLE = { business: 'Demo Business', city: 'Your City', type: 'Other', hasWebsite: 'No', website: '', instagram: 'No', facebook: 'No', googleMaps: 'Not sure', payments: ['Cash'], enquiries: '0 to 10', sales: 'Just started', name: 'Friend', email: 'you@business.com' };

// Smart scoring: every answer moves the score (total weight 95, scaled to 100)
function compute(d) {
  const pays = d.payments || [], digital = pays.some(p => ['UPI or QR', 'Online payment on website', 'Bank transfer'].includes(p));
  const hasSite = d.hasWebsite === 'Yes';
  const web = hasSite ? 16 + (/^https:/i.test(d.website || '') ? 4 : 0) + (pays.includes('Online payment on website') ? 5 : 0) : 0;
  const maps = ({ 'Yes': 20, 'Not sure': 6, 'No': 0 })[d.googleMaps] ?? 0;
  const enq = ({ '0 to 10': 3, '10 to 50': 10, '50 to 200': 16, '200 or more': 20 })[d.enquiries] ?? 0;
  const sales = ({ 'Growing': 10, 'Flat': 6, 'Falling': 2, 'Just started': 4 })[d.sales] ?? 0;
  const pay = Math.min(6, pays.length * 2) + (digital ? 4 : 0);
  const social = (d.instagram === 'Yes' ? 5 : 0) + (d.facebook === 'Yes' ? 5 : 0);
  const comps = [['web', 25, web], ['maps', 20, maps], ['enq', 20, enq], ['sales', 10, sales], ['pay', 10, pay], ['social', 10, social]]
    .map(([id, max, got]) => ({ id, max, got, s5: Math.round(got / max * 5), lost: (max - got) / 95 * 100 }));
  const total = Math.round(comps.reduce((a, c) => a + c.got, 0) / 95 * 100);
  return { comps, total, hasSite, digital, pays,
    webPct: Math.round(web / 25 * 100), readyPct: Math.round((pay + enq + sales) / 40 * 100), foundPct: Math.round((maps + social) / 30 * 100) };
}
function why(c, d, m) {  // returns [whyKey+vars, fixKey]
  const mp = { 'Yes': 1, 'No': 0, 'Not sure': 2 }[d.googleMaps];
  switch (c.id) {
    case 'web': return m.hasSite ? [r('w1_w'), r('w1_f')] : [r('w0_w'), r('w0_f')];
    case 'maps': return [r(mp === 1 ? 'm1_w' : mp === 0 ? 'm0_w' : 'm2_w'), r(mp === 1 ? 'm1_f' : 'm_f')];
    case 'enq': return [r('e_w', { n: tr(d.enquiries || '') }), r(['200 or more', '50 to 200'].includes(d.enquiries) ? 'e_fh' : 'e_fl')];
    case 'sales': { const k = { 'Growing': 1, 'Flat': 2, 'Falling': 3, 'Just started': 4 }[d.sales] || 4; return [r('sa' + k + '_w'), r('sa' + k + '_f')]; }
    case 'pay': return [r('p_w', { list: m.pays.map(tr).join(', ') || '—' }), r(!m.digital ? 'p_fn' : m.pays.length < 3 ? 'p_fm' : 'p_fo')];
    default: { const n = (d.instagram === 'Yes') + (d.facebook === 'Yes'); return [r('so' + n + '_w'), r('so' + n + '_f')]; }
  }
}

window.renderReport = function (animate) {
  if (animate === undefined) animate = true;
  const root = document.querySelector('#reportRoot'); if (!root) return;
  const real = !!window.userData, d = Object.assign({}, SAMPLE, window.userData || {});
  const m = compute(d), score = m.total;
  const biz = esc(d.business), city = esc(d.city), typeTxt = esc(tr(d.type || 'Other')).toLowerCase();
  const byLost = [...m.comps].sort((a, b) => b.lost - a.lost);
  const cname = c => r('c_' + c.id);
  const mapsOk = d.googleMaps === 'Yes';
  const status = !mapsOk ? ['st_nf', 'st_nfs'] : score < 40 ? ['st_start'] : score < 65 ? ['st_passive'] : ['st_strong'];

  // Priority fixes (max 2), driven by the answers
  const flags = [];
  if (!m.hasSite) flags.push('nosite');
  if (!mapsOk) flags.push('maps');
  if (['0 to 10', '10 to 50'].includes(d.enquiries)) flags.push('enq');
  if (d.instagram !== 'Yes' && d.facebook !== 'Yes') flags.push('soc');
  if (d.sales === 'Falling') flags.push('sal');
  if (!flags.length) flags.push('rev');
  const fixes = flags.slice(0, 2);

  // Key insight sentence
  const insParts = [];
  if (!m.hasSite) insParts.push('ins_nosite'); if (!mapsOk) insParts.push('ins_maps');
  if (['0 to 10'].includes(d.enquiries)) insParts.push('ins_enq'); if (d.instagram !== 'Yes' && d.facebook !== 'Yes') insParts.push('ins_social');
  const insight = r('ins_head', { score }) + ' ' + insParts.slice(0, 2).map(k => r(k)).join(' ') + ' ' + r('ins_good');

  // Penalties sorted: lowest marks first
  const losses = [...m.comps].sort((a, b) => a.s5 - b.s5 || b.lost - a.lost);
  // Competitors (sample benchmark around the user's own score)
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const names = COMP[d.type] || COMP['Other'];
  let hs = 0; for (const ch of String(d.city) + String(d.type)) hs = (hs * 31 + ch.charCodeAt(0)) % 997;
  const nm = i => esc(names[i][isHi() ? 1 : 0]);
  const rows = [[r('you_row', { biz }), score, true], [nm(0), clamp(score + 18 + hs % 7, 50, 92)], [nm(1), clamp(score + 6 + (hs >> 3) % 6, 35, 82)], [nm(2), clamp(score - 4 - (hs >> 5) % 6, 5, 70)]];
  const W = a => animate ? 0 : a;
  const days = [1, 2, 3, 4, 5, 6, 7];
  const v = { biz, city, type: typeTxt };

  root.innerHTML = `<style>.fu{animation:fu .6s ease both}@keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}</style>
  ${real ? `<section class="pt-8 fu"><div class="card deep p-5 sm:p-6 flex gap-4 items-start" style="background:#E4F6EE"><span class="w-11 h-11 rounded-full bg-em grid place-items-center shrink-0 shadow-[0_0_0_6px_rgba(0,168,107,.2)]"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><p class="font-semibold leading-relaxed break-words">${r('banner', { name: esc(d.name), biz, email: esc(d.email) })}</p></div></section>` : '<div class="pt-6"></div>'}
  <section class="fu"><p class="text-center text-sm font-bold text-em2">${r('kicker')}</p>
    <div class="card deep mt-4 p-6 sm:p-10">
      <div class="flex flex-wrap items-center gap-3"><h1 class="text-2xl sm:text-3xl font-extrabold break-words">${biz}, ${city}</h1><span class="text-slate2 font-bold">·</span><span class="bg-mint text-em2 text-xs font-bold rounded-full px-3 py-1.5">${r(real ? 'live' : 'sample')}</span></div>
      <div class="mt-8 grid md:grid-cols-5 gap-8 items-center">
        <div class="md:col-span-2 flex flex-col items-center text-center">
          <div class="relative w-52 h-52"><svg viewBox="0 0 120 120" class="w-full h-full -rotate-90"><circle cx="60" cy="60" r="52" fill="none" stroke="#E4F6EE" stroke-width="12"/><circle id="ring" class="ring" cx="60" cy="60" r="52" fill="none" stroke="#00A86B" stroke-width="12" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="${animate ? 326.7 : 326.7 * (1 - score / 100)}"/></svg>
            <div class="absolute inset-0 grid place-items-center"><div><p class="text-6xl font-extrabold leading-none"><span id="score">${animate ? 0 : score}</span></p><p class="text-slate2 font-bold mt-1">/ 100</p></div></div></div>
          <p class="mt-4 bg-mint text-em2 font-bold rounded-full px-4 py-1.5 text-sm">${r(status[0])}</p>
          ${status[1] ? `<p class="mt-2 text-xs text-slate2 font-semibold max-w-[14rem]">${r(status[1])}</p>` : ''}
        </div>
        <div class="md:col-span-3"><p class="text-slate2 leading-relaxed text-lg">${r('note', { type: typeTxt, city, a: esc(cname(byLost[0])).toLowerCase(), b: esc(cname(byLost[1])).toLowerCase() })}</p>
          <div class="mt-5 rounded-2xl bg-navy text-white p-5"><p class="text-xs font-bold tracking-widest text-emerald-300">${r('keyl')}</p><p class="mt-2 leading-relaxed">${insight}</p></div></div>
      </div></div></section>
  <section><h2 class="fu text-3xl font-extrabold">${r('s_fix')}</h2><div class="mt-6 grid md:grid-cols-2 gap-5">
    ${fixes.map((f, i) => `<div class="fu card hov deep p-6 flex gap-4" style="animation-delay:${i * .1}s"><span class="w-11 h-11 rounded-full bg-em text-white font-extrabold grid place-items-center shrink-0 shadow-[0_0_0_6px_rgba(0,168,107,.18)]">${i + 1}</span><div><h3 class="text-xl font-extrabold">${r('f_' + f + '_t')}</h3><p class="mt-2 text-slate2">${r('f_' + f + '_b')}</p></div></div>`).join('')}</div></section>
  <section><h2 class="fu text-3xl font-extrabold">${r('s_break')}</h2><div class="mt-6 grid md:grid-cols-3 gap-5">
    ${[['b_web', m.webPct, !m.hasSite ? 'bw_none' : m.webPct < 60 ? 'bw_low' : 'bw_ok'], ['b_ready', m.readyPct, m.readyPct < 50 ? 'br_low' : 'br_ok'], ['b_found', m.foundPct, m.foundPct < 50 ? 'bf_low' : 'bf_ok']].map((b, i) => `<div class="fu card hov deep p-6" style="animation-delay:${i * .1}s"><div class="flex items-end justify-between gap-3"><h3 class="text-xl font-extrabold">${r(b[0])}</h3><p class="text-3xl font-extrabold ${b[1] < 50 ? 'text-amber-600' : 'text-em2'}">${b[1]}<span class="text-base text-slate2 font-bold"> / 100</span></p></div><div class="mt-4 h-3 rounded-full bg-mint overflow-hidden"><div class="bar h-full rounded-full ${b[1] < 50 ? 'bg-amber-400' : 'bg-em'}" style="width:${W(b[1])}%" data-w="${b[1]}"></div></div><p class="mt-4 text-slate2">${r(b[2])}</p></div>`).join('')}</div></section>
  <section><h2 class="fu text-3xl font-extrabold">${r('s_first')}</h2><div class="mt-6 grid md:grid-cols-3 gap-5">
    ${byLost.slice(0, 3).map((c, i) => `<div class="fu card hov deep p-6" style="animation-delay:${i * .1}s"><div class="flex items-center justify-between gap-2"><span class="w-10 h-10 rounded-full bg-navy text-white font-extrabold grid place-items-center">${i + 1}</span><span class="bg-mint text-em2 text-xs font-extrabold rounded-full px-3 py-1.5">${r('worth', { n: Math.max(1, Math.round(c.lost)) })}</span></div><h3 class="mt-4 text-xl font-extrabold">${cname(c)}</h3><p class="mt-2 text-slate2">${why(c, d, m)[1]}</p></div>`).join('')}</div></section>
  <section><h2 class="fu text-3xl font-extrabold">${r('s_plan')}</h2><p class="fu mt-2 text-slate2">${r('plan_sub', { biz })}</p><div class="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
    ${days.map(n => `<div class="fu card hov deep p-6 ${n === 7 ? 'ring-2 ring-em/40' : ''}" style="animation-delay:${(n % 3) * .1}s"><span class="inline-block bg-navy text-white text-xs font-extrabold rounded-full px-3 py-1">${r('day', { n })}</span><h3 class="mt-3 text-lg font-extrabold leading-snug">${r('d' + n + 't', v)}</h3><p class="mt-3 bg-cream rounded-2xl px-4 py-3 text-sm text-slate2">${r('d' + n + 'c', v)}</p><p class="mt-3 text-sm font-semibold"><span class="text-em2">${r('photo')}</span>: ${r('d' + n + 'p')}</p></div>`).join('')}</div></section>
  <section><h2 class="fu text-3xl font-extrabold">${r('s_loss')}</h2><div class="mt-6 space-y-4">
    ${losses.map((c, i) => { const w = why(c, d, m); return `<div class="acc fu card soft ${i === 0 ? 'open' : ''}"><button type="button" class="w-full flex items-center justify-between gap-4 text-left p-5" aria-expanded="${i === 0}"><span class="flex items-center gap-3 font-bold flex-wrap"><span class="text-em2">#${i + 1}</span><span>${cname(c)}</span><span class="bg-mint text-em2 text-xs font-extrabold rounded-full px-3 py-1">${c.s5}/5</span></span><svg class="shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A86B" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/><path class="vbar" d="M12 5v14"/></svg></button><div class="acc-body"><div class="overflow-hidden"><div class="px-5 pb-5 grid sm:grid-cols-2 gap-4 text-sm"><div class="bg-cream rounded-2xl p-4"><p class="font-bold text-slate2 text-xs tracking-wide mb-1">${r('why')}</p><p>${w[0]}</p></div><div class="bg-mint rounded-2xl p-4"><p class="font-bold text-em2 text-xs tracking-wide mb-1">${r('how')}</p><p>${w[1]}</p></div></div></div></div></div>`; }).join('')}</div></section>
  <section><h2 class="fu text-3xl font-extrabold">${r('s_comp', { city })}</h2><p class="fu mt-2 text-slate2 text-sm">${r('comp_note', { city, type: typeTxt })}</p><div class="fu mt-6 overflow-x-auto"><table class="w-full min-w-[480px] border-separate" style="border-spacing:0 10px"><thead><tr class="text-left text-sm text-slate2"><th class="px-5 pb-1 font-bold">${r('th_b')}</th><th class="px-5 pb-1 font-bold w-1/2">${r('th_s')}</th></tr></thead><tbody>
    ${rows.map(x => { const bg = x[2] ? 'bg-mint' : 'bg-white'; return `<tr class="soft"><td class="${bg} px-5 py-4 font-bold rounded-l-2xl break-words">${x[0]}${x[2] ? ` <span class="ml-1 bg-em text-white text-[10px] font-bold rounded-full px-2 py-0.5">${r('you')}</span>` : `<span class="block text-xs font-semibold text-slate2">${r('comp_tag', { city })}</span>`}</td><td class="${bg} px-5 py-4 rounded-r-2xl"><div class="flex items-center gap-3"><span class="font-extrabold w-8">${x[1]}</span><div class="flex-1 h-2.5 rounded-full bg-navy/10 overflow-hidden"><div class="bar h-full rounded-full ${x[2] ? 'bg-em' : 'bg-navy'}" style="width:${W(x[1])}%" data-w="${x[1]}"></div></div></div></td></tr>`; }).join('')}</tbody></table></div></section>
  <section class="fu card deep p-8 sm:p-12 text-center"><h2 class="text-3xl font-extrabold">${r('cta_h')}</h2><p class="mt-3 text-slate2 text-lg max-w-2xl mx-auto">${r('cta_s')}</p><div class="mt-8 flex flex-wrap justify-center gap-4"><a href="/quote" data-go="quote" data-pick="gbp" class="btn bg-em hover:bg-em2 text-white font-extrabold px-8 py-3.5 rounded-full shadow-[0_0_0_5px_rgba(0,168,107,.22)]">${r('cta_1')}</a><a href="/quote" data-go="quote" class="btn bg-white text-navy border-2 border-navy hover:bg-navy hover:text-white font-extrabold px-8 py-3.5 rounded-full">${r('cta_2')}</a></div><p class="mt-6 text-sm font-semibold text-slate2">${r('cta_c')} <a href="tel:+919414122762" class="font-extrabold text-em2 hover:text-em">+91 9414122762</a></p></section>`;

  root.querySelectorAll('.acc button').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-expanded', b.parentElement.classList.toggle('open'))));
  if (animate) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.querySelectorAll('.bar').forEach(b => b.style.width = b.dataset.w + '%');
      const ring = document.getElementById('ring'); if (ring) ring.style.strokeDashoffset = 326.7 * (1 - score / 100);
    }));
    const el = document.getElementById('score'); let n = 0;
    if (score > 0) { const id = setInterval(() => { n++; el.textContent = n; if (n >= score) clearInterval(id); }, Math.max(12, 1500 / score)); }
  }
};
window.renderReport();

})();
