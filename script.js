// Footer year
var y = document.getElementById('year');
if (y) { y.textContent = new Date().getFullYear(); }

// Project filters
var buttons = document.querySelectorAll('.f');
var cards = document.querySelectorAll('.cards .card');
var count = document.getElementById('count');

function applyFilter(cat) {
  var shown = 0;
  cards.forEach(function (c) {
    var ok = cat === 'all' || (c.getAttribute('data-cat') || '').split(' ').indexOf(cat) !== -1;
    c.hidden = !ok;
    if (ok) { shown++; }
  });
  if (count) { count.textContent = shown + (shown === 1 ? ' project is shown.' : ' projects are shown.'); }
}

buttons.forEach(function (b) {
  b.addEventListener('click', function () {
    buttons.forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on');
    applyFilter(b.getAttribute('data-f'));
  });
});
applyFilter('all');

// Links to a project card: show all projects first if the card is filtered out
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  var id = a.getAttribute('href').slice(1);
  var target = id ? document.getElementById(id) : null;
  if (!target || !target.classList.contains('card')) { return; }
  a.addEventListener('click', function () {
    if (target.hidden) {
      buttons.forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-f') === 'all'); });
      applyFilter('all');
    }
  });
});

// Photo galleries: arrows, dots and swipe (native scrolling)
document.querySelectorAll('.gallery').forEach(function (g) {
  var track = g.querySelector('.slides');
  var slides = track.querySelectorAll('figure');
  if (slides.length < 2) { g.classList.add('single'); return; }

  var prev = document.createElement('button');
  prev.className = 'gbtn prev'; prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous photo'); prev.innerHTML = '&#8249;';
  var next = document.createElement('button');
  next.className = 'gbtn next'; next.type = 'button';
  next.setAttribute('aria-label', 'Next photo'); next.innerHTML = '&#8250;';
  var dots = document.createElement('div');
  dots.className = 'dots';
  slides.forEach(function () { dots.appendChild(document.createElement('span')); });
  g.appendChild(prev); g.appendChild(next); g.appendChild(dots);

  function index() { return Math.round(track.scrollLeft / track.clientWidth); }
  function go(i) {
    var n = (i + slides.length) % slides.length;
    track.scrollTo({ left: n * track.clientWidth, behavior: 'smooth' });
  }
  function mark() {
    var i = index();
    dots.querySelectorAll('span').forEach(function (d, k) { d.classList.toggle('on', k === i); });
  }
  prev.addEventListener('click', function () { go(index() - 1); });
  next.addEventListener('click', function () { go(index() + 1); });
  track.addEventListener('scroll', function () { window.requestAnimationFrame(mark); });
  window.addEventListener('resize', mark);
  mark();
});

// Lightbox
var lb = document.getElementById('lightbox');
var lbImg = document.getElementById('lb-img');
var lbCap = document.getElementById('lb-cap');
var lbClose = document.getElementById('lb-close');
if (lb && typeof lb.showModal === 'function') {
  document.querySelectorAll('.slides img, .early .thumbs img').forEach(function (img) {
    img.parentNode.addEventListener('click', function () {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
      lb.showModal();
    });
  });
  lbClose.addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) { lb.close(); } });
}

// Light and dark appearance
var root = document.documentElement;
var toggle = document.getElementById('theme');
try {
  var saved = localStorage.getItem('theme');
  if (saved) { root.setAttribute('data-theme', saved); }
} catch (e) {}

if (toggle) {
  toggle.addEventListener('click', function () {
    var isDark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

// Robot cell illustration: hold still for people who prefer less motion
var cell = document.querySelector('.cell');
if (cell && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches && cell.pauseAnimations) {
  cell.pauseAnimations();
}

// Job match: compares a pasted job description with the skills shown on this page.
// Everything runs in the browser. Nothing is sent anywhere.
(function () {
  var box = document.getElementById('jd');
  var out = document.getElementById('jd-result');
  var bCheck = document.getElementById('jd-check');
  var bSample = document.getElementById('jd-sample');
  var bClear = document.getElementById('jd-clear');
  if (!box || !out || !bCheck) { return; }

  // g: group, l: label, p: keywords (English and French, lower case, no accents), e: proof, h: link
  var HAVE = [
    { g: 'Robotics', l: 'Industrial robot programming and integration', p: 'robots?|robotics?|robotique|robotise[es]*|robotisation', e: 'Robots integrated on 4 photovoltaic production lines', h: '#rob-01' },
    { g: 'Robotics', l: 'ABB robots (RobotStudio)', p: 'abb|robotstudio|robot studio', e: 'Vision-guided pick and place at Mondragon Assembly', h: '#rob-01' },
    { g: 'Robotics', l: 'Estun robots', p: 'estun', e: 'Vision-guided pick and place at Mondragon Assembly', h: '#rob-01' },
    { g: 'Robotics', l: 'Epson SCARA robots', p: 'epson|scara', e: 'Programmed and integrated at Mondragon Assembly', h: '#rob-01' },
    { g: 'Robotics', l: 'KUKA robots', p: 'kuka', e: 'KUKA KR 210, listed in my skills', h: '#skills' },
    { g: 'Robotics', l: 'Vision-guided pick and place', p: 'pick[ -]?(?:and|&|n)[ -]?place|prise et depose|vision[- ]guided|guidage (?:par vision|robot)|robot guidance', e: 'ABB and Estun robots guided by cameras', h: '#rob-01' },
    { g: 'Robotics', l: 'Coating and dispensing robot', p: 'conformal coating|coating|dispensing|vernissage|nordson|asymtek', e: 'Coating robot programming at Marquardt', h: '#prc-04' },

    { g: 'Machine vision', l: 'Machine vision systems', p: 'machine vision|vision systems?|vision industrielle|systemes? de vision|smart cameras?|industrial cameras?|cameras? industrielles?|vision inspection|camera calibration|controle par vision', e: '3 vision systems used for inspection and robot guidance', h: '#rob-01' },
    { g: 'Machine vision', l: 'Cognex', p: 'cognex|vision ?pro', e: 'Cognex VisionPro on photovoltaic lines', h: '#rob-01' },
    { g: 'Machine vision', l: 'Keyence', p: 'keyence', e: 'Keyence vision on photovoltaic lines', h: '#rob-01' },
    { g: 'Machine vision', l: 'Hikrobot', p: 'hikrobot|hikvision', e: 'Hikrobot MVS on photovoltaic lines', h: '#rob-01' },

    { g: 'PLC and control', l: 'PLC programming', p: 'plcs?|programmable logic controllers?|automates? (?:programmables?|industriels?)|programmation (?:d\')?automates?|automaticien(?:ne)?s?', e: 'Beckhoff and Siemens PLCs on production lines', h: '#exp-mondragon' },
    { g: 'PLC and control', l: 'Industrial automation', p: 'automation|automatismes?|automatisation|automatise[es]*', e: 'Automation Engineer at Mondragon Assembly Group since 2024', h: '#exp-mondragon' },
    { g: 'PLC and control', l: 'Beckhoff TwinCAT 3', p: 'beckhoff|twincat(?: ?[23])?', e: 'Daily tool at Mondragon Assembly, plus 12 Beckhoff training modules', h: '#certs' },
    { g: 'PLC and control', l: 'Siemens TIA Portal (S7-1200, S7-1500)', p: 'siemens|tia[ -]?portal|s7(?:[- ]?1[25]00)?|simatic', e: 'Line migrated to an S7-1200 with a new HMI', h: '#plc-02' },
    { g: 'PLC and control', l: 'IEC 61131-3 languages', p: 'structured text|texte structure|ladder|langage a contacts?|sfc|grafcet|iec ?61131(?:-3)?|function blocks?', e: 'Structured Text, Ladder, SFC and GRAFCET', h: '#skills' },
    { g: 'PLC and control', l: 'HMI development', p: 'hmis?|ihm|interfaces? homme[- ]machine|human[- ]machine interfaces?|wincc|intouch|operator panels?', e: 'TwinCAT HMI, WinCC and InTouch. HMI designed for the Poulina line', h: '#plc-02' },
    { g: 'PLC and control', l: 'Machine safety', p: 'twinsafe|machine safety|safety (?:plcs?|interlocks?|circuits?|relays?|systems?|functions?)|functional safety|securite (?:des )?machines?|securite fonctionnelle', e: 'Safety interlocks and Beckhoff TwinSAFE training', h: '#skills' },

    { g: 'Networks and drives', l: 'EtherCAT', p: 'ethercat', e: 'Used on photovoltaic lines', h: '#rob-01' },
    { g: 'Networks and drives', l: 'PROFINET', p: 'profinet', e: 'Used at Mondragon Assembly', h: '#exp-mondragon' },
    { g: 'Networks and drives', l: 'EtherNet/IP', p: 'ethernet ?[/-] ?ip|ethernet ip', e: 'Used at Mondragon Assembly', h: '#exp-mondragon' },
    { g: 'Networks and drives', l: 'Modbus TCP', p: 'modbus', e: 'Listed in my skills', h: '#skills' },
    { g: 'Networks and drives', l: 'Industrial networks', p: 'fieldbus(?:es)?|bus de terrain|industrial (?:networks?|communication|protocols?)|reseaux industriels|protocoles? industriels?|protocoles? de communication|communication protocols?', e: 'EtherCAT, PROFINET, EtherNet/IP and Modbus TCP', h: '#skills' },
    { g: 'Networks and drives', l: 'Servo drives and motion', p: 'servo[a-z]*|motion control|controle de mouvement|commande d\'axes|variateurs?|yaskawa|inovance', e: 'Yaskawa and Inovance servo drives', h: '#skills' },

    { g: 'Machine design', l: 'SolidWorks', p: 'solidworks|solid works', e: 'Car lift designed from the first sketch to the drawing package', h: '#mec-03' },
    { g: 'Machine design', l: 'Mechanical design and CAD', p: 'cad|cao|3d (?:modell?ing|design)|modelisation 3d|mechanical design|conception mecanique|(?:technical|mechanical) drawings?|dessins? techniques?|machine design|conception de machines?', e: 'Mobile hydraulic car lift, with strength checks', h: '#mec-03' },
    { g: 'Machine design', l: 'EPLAN and schematic reading', p: 'eplan', e: 'Listed in my skills', h: '#skills' },
    { g: 'Machine design', l: 'Electrical installation and wiring', p: 'electrical (?:schematics?|drawings?|diagrams?|design|cabinets?|panels?|installations?)|wiring(?: diagrams?)?|schemas? electriques?|armoires? electriques?|cablage|control cabinets?|installations? electriques?', e: 'Electrical installation and I/O wiring on the sky conveyor extension', h: '#plc-05' },
    { g: 'Machine design', l: 'Hydraulics', p: 'hydrauli[a-z]*', e: 'Hydraulic sizing of a car lift for 2,700 kg vehicles', h: '#mec-03' },
    { g: 'Machine design', l: 'Pneumatics', p: 'pneumati[a-z]*', e: 'Wet wipe production machines at SO.TU.LIN', h: '#mnt-07' },

    { g: 'On site', l: 'Commissioning', p: 'commissioning|commission(?:s|ed)? (?:the |new |our )?(?:machines?|lines?|equipment|systems?|robots?)|mises? en (?:service|route)', e: '4 complete lines brought into production', h: '#rob-01' },
    { g: 'On site', l: 'Production lines and special machines', p: 'production lines?|assembly lines?|lignes? de production|lignes? d\'assemblage|machines? speciales?|special[- ]purpose machines?|special machines?', e: '4 photovoltaic lines, plus a weighing and packing line', h: '#rob-01' },
    { g: 'On site', l: 'Work at customer sites abroad', p: 'travel(?:l?ing)?|deplacements?|on[- ]site|sur sites?|customer sites?|chez (?:le|les|nos) clients?|field service|international(?:e|es|ly)?|a l\'etranger|abroad|worldwide', e: 'Customer sites across the MENA region, Europe and Asia', h: '#exp-mondragon' },
    { g: 'On site', l: 'Troubleshooting', p: 'troubleshoot[a-z]*|depannage|diagnosti[a-z]*|debug[a-z]*|fault[- ]finding', e: 'Downtime reduced at Marquardt and Sumitomo', h: '#exp-marquardt' },
    { g: 'On site', l: 'Preventive maintenance', p: 'maintenance', e: 'Maintenance plan based on FMECA for automated machines', h: '#mnt-07' },
    { g: 'On site', l: 'Work instructions and operator training', p: 'work instructions?|instructions? de travail|modes? operatoires?|technical documentation|documentation technique|(?:operator|customer|user|staff) training|train(?:ing)? (?:of )?(?:operators?|customers?|users?|technicians?)|formation des? (?:operateurs?|clients?|utilisateurs?|techniciens?)|former les (?:operateurs|clients|utilisateurs|techniciens)', e: 'Wrote work instructions and trained supervisors and operators', h: '#exp-sumitomo' },
    { g: 'On site', l: 'Photovoltaic industry', p: 'solar|solaires?|photovolta[a-z]*', e: 'Photovoltaic module lines, including a 500 MW plant', h: '#rob-01' },

    { g: 'Process and quality', l: 'Lean manufacturing', p: 'lean|vsm|oee|trs|smed|5s|6s|continuous improvement|amelioration continue', e: 'VSM, OEE, SMED and 6S at Sumitomo', h: '#exp-sumitomo' },
    { g: 'Process and quality', l: 'FMEA and FMECA', p: 'p?fmea|fmeca|amdec', e: 'PFMEA at Sumitomo, AIAG-VDA FMEA training', h: '#certs' },
    { g: 'Process and quality', l: 'Problem solving', p: '8d|ishikawa|5 whys?|5 pourquoi|root cause|causes? racines?|problem[- ]solving|resolution de problemes?', e: 'Ishikawa and 5 Whys on recurring issues at Marquardt', h: '#exp-marquardt' },
    { g: 'Process and quality', l: 'SPC, MSA and PPAP/APQP', p: 'spc|msa|ppap|apqp|core tools', e: 'Training attestation', h: '#certs' },
    { g: 'Process and quality', l: 'Six Sigma', p: 'six sigma|6 ?sigma|yellow belt', e: 'Six Sigma Yellow Belt', h: '#certs' },
    { g: 'Process and quality', l: 'Electronics manufacturing', p: 'smt|tht|cms|soldering|brasage|pcbs?|pcba|press[- ]?fit|cartes? electroniques?|electronics? (?:manufacturing|production|assembly)', e: 'Soldering, press-fit and coating processes at Marquardt', h: '#exp-marquardt' },

    { g: 'Software', l: 'Python', p: 'python', e: 'Scripts for test tools and device communication, PyLabRobot', h: '#sw-06' },
    { g: 'Software', l: 'Git and GitHub', p: 'git|github|version control|source control|gestion de versions?', e: 'Public repository', h: '#sw-06' },
    { g: 'Software', l: 'Arduino', p: 'arduino', e: 'Doctor J robot electronics', h: '#volunteering' },
    { g: 'Software', l: 'LabVIEW (internship level)', p: 'labview', e: 'LED tests on a CAN test bench at ALL Circuits', h: '#exp-allcircuits' },

    { g: 'Languages and education', l: 'English, C1', p: 'english|anglais', e: 'EF SET C1 certificate', h: '#certs' },
    { g: 'Languages and education', l: 'French, C1', p: 'french|francais|francophone', e: 'Working language', h: '#about' },
    { g: 'Languages and education', l: 'Arabic, native', p: 'arabic|arabe', e: 'Native language', h: '#about' },
    { g: 'Languages and education', l: 'Engineering degree, Master\'s level', p: '(?:engineering|master\'?s?|bachelor\'?s?) degree|degree in [a-z ]*engineering|diplome d\'ingenieur|ingenieur diplome|bac ?\\+ ?5|ecole d\'ingenieurs?|msc|master', e: 'Electromechanical Engineering, Université Libre de Tunis', h: '#edu' }
  ];

  // Things recruiters often ask for that are not in my hands-on experience. c: the closest thing I do have.
  var GAPS = [
    { l: 'Rockwell / Allen-Bradley', p: 'rockwell|allen[- ]bradley|studio ?5000|rslogix|controllogix|compactlogix', c: 'Closest: Beckhoff TwinCAT 3 and Siemens TIA Portal' },
    { l: 'Schneider Electric PLCs', p: 'schneider|unity pro|ecostruxure|control expert', c: 'Closest: Beckhoff TwinCAT 3 and Siemens TIA Portal' },
    { l: 'Omron', p: 'omron|sysmac', c: 'Closest: Beckhoff TwinCAT 3 and Siemens TIA Portal' },
    { l: 'Mitsubishi', p: 'mitsubishi|melsec|gx works', c: 'Closest: Beckhoff TwinCAT 3 and Siemens TIA Portal' },
    { l: 'B&R', p: 'b&r|b ?& ?r automation', c: 'Closest: Beckhoff TwinCAT 3 and Siemens TIA Portal' },
    { l: 'CODESYS', p: 'codesys', c: 'Closest: Beckhoff TwinCAT 3 and IEC 61131-3 languages' },
    { l: 'Fanuc robots', p: 'fanuc', c: 'Closest: ABB, Estun, Epson SCARA and KUKA' },
    { l: 'Yaskawa Motoman robots', p: 'motoman', c: 'Closest: ABB, Estun, Epson SCARA and KUKA' },
    { l: 'Stäubli robots', p: 'staubli', c: 'Closest: ABB, Estun, Epson SCARA and KUKA' },
    { l: 'Universal Robots and cobots', p: 'universal robots?|cobots?', c: 'Closest: ABB, Estun, Epson SCARA and KUKA' },
    { l: 'SCADA and MES', p: 'scada|ignition|mes systems?|manufacturing execution systems?', c: 'Closest: HMI development with WinCC, InTouch and TwinCAT HMI' },
    { l: 'C++', p: 'c\\+\\+', c: 'Closest: Structured Text and Python' },
    { l: 'C# and .NET', p: 'c#|\\.net|dotnet', c: 'Closest: Structured Text and Python' },
    { l: 'ROS', p: 'ros ?2?', c: 'Closest: Python and PyLabRobot' },
    { l: 'SQL and databases', p: 'sql|databases?|bases? de donnees', c: 'Closest: Python scripts for log analysis' },
    { l: 'AutoCAD, CATIA, Inventor, Creo or NX', p: 'autocad|catia|inventor|creo|siemens nx', c: 'Closest: SolidWorks and EPLAN' },
    { l: 'Halcon or OpenCV', p: 'halcon|opencv', c: 'Closest: Cognex VisionPro, Keyence and Hikrobot' },
    { l: 'German', p: 'german|allemand|deutsch', c: 'Not yet. I work in English and French, both C1' },
    { l: 'Italian', p: 'italian|italien', c: 'Not yet. I work in English and French, both C1' },
    { l: 'Spanish', p: 'spanish|espagnol', c: 'Not yet. I work in English and French, both C1' },
    { l: 'Dutch', p: 'dutch|neerlandais', c: 'Not yet. I work in English and French, both C1' }
  ];

  function rx(p) { return new RegExp('(?:^|[^a-z0-9])(?:' + p + ')(?![a-z0-9])'); }
  HAVE.forEach(function (s) { s.r = rx(s.p); });
  GAPS.forEach(function (s) { s.r = rx(s.p); });

  function clean(t) {
    t = t.toLowerCase().replace(/[‘’ʼ`]/g, "'");
    if (t.normalize) { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    return t.replace(/\s+/g, ' ');
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text) { n.textContent = text; }
    return n;
  }

  function check() {
    var text = clean(box.value);
    out.textContent = '';
    if (text.replace(/\s/g, '').length < 20) {
      out.appendChild(el('p', 'mhint', 'Paste a job description first, then check the match.'));
      return;
    }
    var hits = HAVE.filter(function (s) { return s.r.test(text); });
    var gaps = GAPS.filter(function (s) { return s.r.test(text); });

    if (!hits.length && !gaps.length) {
      out.appendChild(el('p', 'msum', 'No known keyword found.'));
      out.appendChild(el('p', 'mhint', 'Try the full job description, with the technical requirements. English and French are supported.'));
      return;
    }
    var sum = el('p', 'msum');
    var n = el('b', '', String(hits.length));
    sum.appendChild(n);
    sum.appendChild(document.createTextNode(hits.length === 1 ? ' requirement from this job is covered by my experience.' : ' requirements from this job are covered by my experience.'));
    out.appendChild(sum);
    out.appendChild(el('p', 'mhint', 'This is a keyword check on what is shown on this page, not a score. Each line links to the proof.'));

    var last = '';
    hits.forEach(function (s) {
      if (s.g !== last) { out.appendChild(el('p', 'mgroup', s.g)); last = s.g; }
      var row = el('div', 'mrow');
      row.appendChild(el('b', '', s.l));
      row.appendChild(el('span', '', s.e));
      var a = el('a', 'go', 'See the proof');
      a.href = s.h;
      row.appendChild(a);
      out.appendChild(row);
    });

    if (gaps.length) {
      out.appendChild(el('p', 'mgroup gap', 'Mentioned in this job, not in my hands-on experience yet'));
      gaps.forEach(function (s) {
        var row = el('div', 'mrow gap');
        row.appendChild(el('b', '', s.l));
        row.appendChild(el('span', '', s.c));
        row.appendChild(el('span', '', ''));
        out.appendChild(row);
      });
    }
  }

  bCheck.addEventListener('click', check);
  if (bClear) { bClear.addEventListener('click', function () { box.value = ''; out.textContent = ''; box.focus(); }); }
  if (bSample) {
    bSample.addEventListener('click', function () {
      box.value = 'Automation Engineer (example)\n\nYou will program Beckhoff TwinCAT 3 and Siemens TIA Portal PLCs, integrate ABB and Fanuc robots with Cognex vision systems and develop HMI screens. You will commission machines at customer sites (around 40% travel), work with EtherCAT and PROFINET networks and read electrical schematics in EPLAN. Python is a plus.\n\nEngineering degree required. Fluent English, German is an advantage.';
      check();
    });
  }
  // A proof link may point to a project hidden by the filters: show all projects first
  out.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) { return; }
    var t = document.getElementById(a.getAttribute('href').slice(1));
    if (t && t.hidden) {
      buttons.forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-f') === 'all'); });
      applyFilter('all');
    }
  });
})();
