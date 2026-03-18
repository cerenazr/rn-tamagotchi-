import { useState, useRef, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';

// ─── Constants ───────────────────────────────────────────────
const MIN_STAT           = 0;
const MAX_STAT           = 100;
const PLAY_HUNGER_COST   = 10;
const REST_ENERGY_PER_SEC = 2;
const HUNGER_LOW         = 30;
const HAPPINESS_LOW      = 30;
const HAPPINESS_HIGH     = 70;
const ENERGY_LOW         = 20;
const BAR_BLOCKS         = 10;
const XP_PER_LEVEL       = 100;
const FEED_XP            = 5;

// ─── Data ────────────────────────────────────────────────────
const ACTIVITIES = [
  { label: 'Oyun Oyna', image: require('./assets/cat/activities/console-game.jpg'), energyCost: 5,  happinessGain: 10, xp: 10, coins: 10 },
  { label: 'Top At!',   image: require('./assets/cat/activities/football.jpg'),     energyCost: 15, happinessGain: 25, xp: 20, coins: 15 },
  { label: 'Raket Sal!',image: require('./assets/cat/activities/tenis.jpg'),        energyCost: 20, happinessGain: 35, xp: 30, coins: 20 },
  { label: 'Bowling!',  image: require('./assets/cat/activities/bowling.jpg'),      energyCost: 10, happinessGain: 15, xp: 15, coins: 12 },
  { label: 'Kitap Oku', image: require('./assets/cat/activities/book.jpg'),         energyCost: 5,  happinessGain: 8,  xp: 25, coins: 8  },
];

const FOODS = [
  { label: 'Patates',  image: require('./assets/cat/food/patates.jpg'),  hunger: 10 },
  { label: 'Burger',   image: require('./assets/cat/food/burger.jpg'),   hunger: 25 },
  { label: 'Pizza',    image: require('./assets/cat/food/pizza.jpg'),    hunger: 30 },
  { label: 'Pancake',  image: require('./assets/cat/food/pancake.jpg'),  hunger: 20 },
  { label: 'Tost',     image: require('./assets/cat/food/tost.jpg'),     hunger: 15 },
  { label: 'Kruvasan', image: require('./assets/cat/food/kruvasan.jpg'), hunger: 12 },
];

// ─── Achievements ────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first_feed',   icon: '🍗', label: 'İlk Adım',        desc: 'İlk kez beslendi!' },
  { id: 'full_happy',   icon: '🎉', label: 'Mutlu Son',        desc: 'Mutluluk 100\'e ulaştı!' },
  { id: 'energy_full',  icon: '⚡', label: 'Enerjik!',         desc: 'Enerji tamamen doldu!' },
  { id: 'catch_master', icon: '🐟', label: 'Balık Avcısı',     desc: 'Balık Yakala\'da 5+ yakalandı!' },
  { id: 'simon_master', icon: '🎨', label: 'Simon Ustası',     desc: 'Simon\'da 5. seviyeye ulaşıldı!' },
  { id: 'math_genius',  icon: '🧮', label: 'Matematik Dahisi', desc: 'Matematikten 5/5 alındı!' },
];

// ─── Color Palette ───────────────────────────────────────────
const COLORS = {
  bg:        '#FFF9E6',
  card:      '#FFFFFF',
  border:    '#2C3E50',
  text:      '#2C3E50',
  textDim:   '#7F8C8D',
  barGreen:  '#27AE60',
  barYellow: '#F39C12',
  barRed:    '#E74C3C',
  barEmpty:  '#ECF0F1',
  btnFeed:   '#E74C3C',
  btnPlay:   '#27AE60',
  btnRest:   '#8E44AD',
  btnText:   '#FFFFFF',
  xpFill:    '#F39C12',
  bubble:    '#FFFDE7',
};

const FONT = 'VT323_400Regular';

// ─── Sprites ─────────────────────────────────────────────────
const SPRITES = {
  normal: require('./assets/cat/cat_normal.png'),
  happy:  require('./assets/cat/cat_happy.png'),
  hungry: require('./assets/cat/cat_hungry.png'),
  sleep:  require('./assets/cat/cat_sleep.png'),
  bored:  require('./assets/cat/cat_bored.png'),
};

function getSprite(aclik, mutluluk, enerji, isResting) {
  if (isResting || enerji < ENERGY_LOW) return SPRITES.sleep;
  if (aclik < HUNGER_LOW)               return SPRITES.hungry;
  if (mutluluk < HAPPINESS_LOW)         return SPRITES.bored;
  if (mutluluk > HAPPINESS_HIGH)        return SPRITES.happy;
  return SPRITES.normal;
}

// ─── ThoughtBubble ───────────────────────────────────────────
function ThoughtBubble({ aclik, mutluluk, enerji, isResting, onNavigate }) {
  if (isResting) {
    return (
      <View style={styles.bubble}>
        <Text style={styles.bubbleZzz}>z Z z</Text>
        <View style={styles.bubbleTail} />
      </View>
    );
  }

  let message = null;
  let target  = null;

  if (mutluluk >= MAX_STAT)            { message = '🎉 Çok mutluyum!'; target = null; }
  else if (aclik >= MAX_STAT)          { message = '😋 Doydum!';      target = null; }
  else if (enerji < ENERGY_LOW)        { message = '💤 Yoruldum...';  target = null; }
  else if (aclik < HUNGER_LOW)         { message = '🍖 Acıktım!';    target = 'feed'; }
  else if (mutluluk < HAPPINESS_LOW)   { message = '😴 Sıkıldım!';   target = 'play'; }

  if (!message) return null;

  return (
    <TouchableOpacity
      onPress={target ? () => onNavigate(target) : undefined}
      activeOpacity={target ? 0.7 : 1}
      style={styles.bubble}
    >
      <Text style={styles.bubbleText}>{message}</Text>
      <View style={styles.bubbleTail} />
    </TouchableOpacity>
  );
}

// ─── Shared Components ───────────────────────────────────────
function PixelBar({ label, value }) {
  const filled   = Math.round((value / MAX_STAT) * BAR_BLOCKS);
  const barColor = value > 60 ? COLORS.barGreen
                 : value > 30 ? COLORS.barYellow
                 : COLORS.barRed;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barContainer}>
        {Array.from({ length: BAR_BLOCKS }, (_, i) => (
          <View
            key={i}
            style={[styles.barSegment, { backgroundColor: i < filled ? barColor : COLORS.barEmpty }]}
          />
        ))}
      </View>
    </View>
  );
}

function PixelButton({ icon, label, onPress, color, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.pixelBtn, { backgroundColor: disabled ? COLORS.barEmpty : color }]}
    >
      {icon ? <Text style={styles.pixelBtnIcon}>{icon}</Text> : null}
      <Text style={styles.pixelBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Mini-Game: Balık Yakala ──────────────────────────────────
function CatchGame({ onComplete }) {
  const [fish, setFish]         = useState([]);
  const [score, setScore]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [phase, setPhase]       = useState('intro');
  const fishIdRef               = useRef(0);
  const scoreRef                = useRef(0);

  // Countdown — only active while playing
  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setPhase('over'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Fish spawner — only active while playing
  useEffect(() => {
    if (phase !== 'playing') return;
    const spawner = setInterval(() => {
      setFish(prev => {
        if (prev.length >= 5) return prev;
        const id = fishIdRef.current++;
        return [...prev, {
          id,
          x: Math.floor(Math.random() * 220),
          y: Math.floor(Math.random() * 130),
        }];
      });
    }, 1200);
    return () => clearInterval(spawner);
  }, [phase]);

  const catchFish = (id) => {
    setFish(prev => prev.filter(f => f.id !== id));
    scoreRef.current += 1;
    setScore(scoreRef.current);
  };

  if (phase === 'intro') {
    return (
      <View style={styles.gameIntro}>
        <Text style={styles.gameIntroEmoji}>🐟</Text>
        <Text style={styles.gameIntroTitle}>NASIL OYNANIR?</Text>
        <Text style={styles.gameIntroDesc}>
          Ekranda balıklar belirecek.{'\n'}
          10 saniye içinde hepsine dokun!{'\n'}
          Ne kadar çok yaklarsan{'\n'}
          o kadar çok ödül kazanırsın!
        </Text>
        <PixelButton label="▶ BAŞLA!" onPress={() => setPhase('playing')} color={COLORS.btnPlay} />
      </View>
    );
  }

  if (phase === 'over') {
    return (
      <View style={styles.gameResult}>
        <Text style={styles.gameResultEmoji}>🐟</Text>
        <Text style={styles.gameResultText}>Yakaladın: {score} balık!</Text>
        <Text style={styles.gameResultSub}>
          +{score * 3} 😊  +{score * 5} XP  +{score * 2} 🪙
        </Text>
        <PixelButton label="ÖDÜLÜ AL!" onPress={() => onComplete(score)} color={COLORS.btnPlay} />
      </View>
    );
  }

  return (
    <View style={styles.gameContent}>
      <View style={styles.gameStatRow}>
        <Text style={styles.gameStat}>⏱ {timeLeft}s</Text>
        <Text style={styles.gameStat}>🐟 {score}</Text>
      </View>
      <Text style={styles.gameHint}>Balıklara hızlıca dokun!</Text>
      <View style={styles.catchArea}>
        {fish.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.fishBtn, { left: f.x, top: f.y }]}
            onPress={() => catchFish(f.id)}
            activeOpacity={0.6}
          >
            <Text style={styles.fishEmoji}>🐟</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Mini-Game: Simon Söyledi ─────────────────────────────────
const SIMON_COLORS = ['#E74C3C', '#27AE60', '#3498DB', '#F39C12'];

function SimonGame({ onComplete }) {
  const [phase, setPhase]       = useState('idle');   // idle|showing|input|over
  const [activeIdx, setActiveIdx] = useState(-1);
  const [level, setLevel]       = useState(0);
  const [feedback, setFeedback] = useState('');
  const seqRef                  = useRef([]);
  const inputRef                = useRef([]);
  const mountedRef              = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const showSequence = useCallback((seq) => {
    if (!mountedRef.current) return;
    setPhase('showing');
    setFeedback('👁 İzle...');
    seq.forEach((idx, i) => {
      setTimeout(() => { if (mountedRef.current) setActiveIdx(idx); },  600 + i * 900);
      setTimeout(() => { if (mountedRef.current) setActiveIdx(-1); },   600 + i * 900 + 500);
    });
    setTimeout(() => {
      if (!mountedRef.current) return;
      inputRef.current = [];
      setPhase('input');
      setFeedback('👆 Tekrarla!');
    }, 600 + seq.length * 900 + 200);
  }, []);

  const startGame = () => {
    const first = Math.floor(Math.random() * 4);
    seqRef.current = [first];
    inputRef.current = [];
    setLevel(1);
    showSequence([first]);
  };

  const handlePress = (idx) => {
    if (phase !== 'input') return;
    const pos = inputRef.current.length;
    inputRef.current = [...inputRef.current, idx];

    if (inputRef.current[pos] !== seqRef.current[pos]) {
      setPhase('over');
      setFeedback('');
      return;
    }

    if (inputRef.current.length === seqRef.current.length) {
      const nextSeq = [...seqRef.current, Math.floor(Math.random() * 4)];
      seqRef.current = nextSeq;
      setLevel(prev => prev + 1);
      setFeedback('✅ Harika!');
      setTimeout(() => showSequence(nextSeq), 700);
    }
  };

  if (phase === 'idle') {
    return (
      <View style={styles.gameIntro}>
        <Text style={styles.gameIntroEmoji}>🎨</Text>
        <Text style={styles.gameIntroTitle}>NASIL OYNANIR?</Text>
        <Text style={styles.gameIntroDesc}>
          Renkli kutucuklar sırayla yanıp{'\n'}
          sönecek. Aynı sırayla tıkla!{'\n'}
          Her seviyede bir renk daha eklenir.{'\n'}
          Yanlış basarsan oyun biter!
        </Text>
        <PixelButton label="▶ BAŞLA!" onPress={startGame} color={COLORS.btnPlay} />
      </View>
    );
  }

  if (phase === 'over') {
    return (
      <View style={styles.gameResult}>
        <Text style={styles.gameResultEmoji}>🎨</Text>
        <Text style={styles.gameResultText}>Seviye {level} tamamlandı!</Text>
        <Text style={styles.gameResultSub}>
          +{level * 5} 😊  +{level * 10} XP  +{level * 5} 🪙
        </Text>
        <PixelButton label="ÖDÜLÜ AL!" onPress={() => onComplete(level)} color={COLORS.btnPlay} />
      </View>
    );
  }

  return (
    <View style={styles.gameContent}>
      <View style={styles.gameStatRow}>
        <Text style={styles.gameStat}>Seviye {level}</Text>
        <Text style={styles.gameStat}>{feedback}</Text>
      </View>
      <View style={styles.simonGrid}>
        {SIMON_COLORS.map((color, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handlePress(idx)}
            activeOpacity={0.7}
            style={[
              styles.simonBtn,
              { backgroundColor: activeIdx === idx ? '#FFFFFF' : color },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Mini-Game: Hızlı Matematik ───────────────────────────────
function generateQuestion() {
  const ops = ['+', '-', '×'];
  const op  = ops[Math.floor(Math.random() * 3)];
  let a, b, answer;
  if (op === '+') { a = Math.floor(Math.random()*15)+1; b = Math.floor(Math.random()*15)+1; answer = a + b; }
  else if (op === '-') { a = Math.floor(Math.random()*15)+10; b = Math.floor(Math.random()*10)+1; answer = a - b; }
  else { a = Math.floor(Math.random()*9)+2; b = Math.floor(Math.random()*4)+2; answer = a * b; }

  const wrongs = new Set();
  while (wrongs.size < 2) {
    const d = Math.floor(Math.random() * 6) + 1;
    const c = Math.random() < 0.5 ? answer + d : Math.max(1, answer - d);
    if (c !== answer) wrongs.add(c);
  }
  const choices = [answer, ...[...wrongs]].sort(() => Math.random() - 0.5);
  return { question: `${a} ${op} ${b} = ?`, answer, choices };
}

function MathGame({ onComplete }) {
  const [questions]             = useState(() => Array.from({ length: 5 }, generateQuestion));
  const [current, setCurrent]   = useState(0);
  const [score, setScore]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(null);
  const [phase, setPhase]       = useState('intro');

  // Reset timer when question changes
  useEffect(() => {
    if (phase !== 'playing') return;
    setAnswered(false);
    setLastCorrect(null);
    setTimeLeft(5);
  }, [current, phase]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing' || answered) return;
    if (timeLeft <= 0) {
      setAnswered(true);
      setLastCorrect(false);
      setTimeout(() => {
        if (current >= 4) setPhase('over');
        else setCurrent(c => c + 1);
      }, 700);
      return;
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answered, phase, current]);

  const handleAnswer = (choice) => {
    if (answered || phase !== 'playing') return;
    const isCorrect = choice === questions[current].answer;
    setAnswered(true);
    setLastCorrect(isCorrect);
    if (isCorrect) setScore(prev => prev + 1);
    setTimeout(() => {
      if (current >= 4) setPhase('over');
      else setCurrent(c => c + 1);
    }, 700);
  };

  if (phase === 'intro') {
    return (
      <View style={styles.gameIntro}>
        <Text style={styles.gameIntroEmoji}>➕</Text>
        <Text style={styles.gameIntroTitle}>NASIL OYNANIR?</Text>
        <Text style={styles.gameIntroDesc}>
          5 matematik sorusu çözeceksin.{'\n'}
          Her soru için sadece 5 saniyene var!{'\n'}
          3 seçenekten doğrusunu seç.{'\n'}
          Ne kadar çok doğru, o kadar ödül!
        </Text>
        <PixelButton label="▶ BAŞLA!" onPress={() => setPhase('playing')} color={COLORS.btnPlay} />
      </View>
    );
  }

  if (phase === 'over') {
    return (
      <View style={styles.gameResult}>
        <Text style={styles.gameResultEmoji}>➕</Text>
        <Text style={styles.gameResultText}>Doğru: {score}/5</Text>
        <Text style={styles.gameResultSub}>
          +{score * 10} 😊  +{score * 15} XP  +{score * 8} 🪙
        </Text>
        <PixelButton label="ÖDÜLÜ AL!" onPress={() => onComplete(score)} color={COLORS.btnPlay} />
      </View>
    );
  }

  const q = questions[current];
  const timerColor = timeLeft <= 2 ? COLORS.barRed : timeLeft <= 3 ? COLORS.barYellow : COLORS.barGreen;

  return (
    <View style={styles.gameContent}>
      <View style={styles.gameStatRow}>
        <Text style={styles.gameStat}>Soru {current + 1}/5</Text>
        <Text style={[styles.gameStat, { color: timerColor }]}>⏱ {timeLeft}s</Text>
        <Text style={styles.gameStat}>⭐ {score}</Text>
      </View>
      <Text style={styles.mathQuestion}>{q.question}</Text>
      {lastCorrect !== null && (
        <Text style={[styles.mathFeedback, { color: lastCorrect ? COLORS.barGreen : COLORS.barRed }]}>
          {lastCorrect ? '✅ Doğru!' : '❌ Yanlış!'}
        </Text>
      )}
      <View style={styles.mathChoices}>
        {q.choices.map((c, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleAnswer(c)}
            disabled={answered}
            activeOpacity={0.75}
            style={[
              styles.mathChoice,
              answered && c === q.answer && { backgroundColor: COLORS.barGreen },
              answered && c !== q.answer && { opacity: 0.4 },
            ]}
          >
            <Text style={styles.mathChoiceText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── AchievementBanner ───────────────────────────────────────
function AchievementBanner({ achievement }) {
  if (!achievement) return null;
  return (
    <View style={styles.achBanner}>
      <Text style={styles.achBannerIcon}>{achievement.icon}</Text>
      <View style={styles.achBannerText}>
        <Text style={styles.achBannerTitle}>🏆 ROZET KAZANILDI!</Text>
        <Text style={styles.achBannerLabel}>{achievement.label}</Text>
      </View>
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────
function Card({ isim, tur }) {
  const [screen, setScreen]             = useState('home');
  const [aclik, setAclik]               = useState(50);
  const [mutluluk, setMutluluk]         = useState(50);
  const [enerji, setEnerji]             = useState(80);
  const [isResting, setIsResting]       = useState(false);
  const [xp, setXp]                     = useState(0);
  const [coins, setCoins]               = useState(0);
  const [achievements, setAchievements] = useState(new Set());
  const [achPopup, setAchPopup]         = useState(null);
  const restInterval                    = useRef(null);
  const tickInterval                    = useRef(null);
  const idleAnim                        = useRef(new Animated.Value(0)).current;
  const unlockedRef                     = useRef(new Set());

  // Rozet kilidi açma
  const unlockAchievement = useCallback((id) => {
    if (unlockedRef.current.has(id)) return;
    unlockedRef.current.add(id);
    setAchievements(new Set(unlockedRef.current));
    const a = ACHIEVEMENTS.find(a => a.id === id);
    setAchPopup(a);
    setTimeout(() => setAchPopup(null), 2500);
  }, []);

  // Enerji dolunca rozet
  const prevEnergyFull = useRef(false);
  useEffect(() => {
    const full = enerji >= MAX_STAT;
    if (full && !prevEnergyFull.current) unlockAchievement('energy_full');
    prevEnergyFull.current = full;
  }, [enerji, unlockAchievement]);

  const level      = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpProgress = xp % XP_PER_LEVEL;
  const isBored    = mutluluk < HAPPINESS_LOW;
  const isHappy    = mutluluk > HAPPINESS_HIGH;

  // Idle animation
  useEffect(() => {
    const duration = isResting ? 2500 : isHappy ? 500 : 1200;
    const distance = isResting ? -3 : -6;
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(idleAnim, { toValue: distance, duration, useNativeDriver: true }),
      Animated.timing(idleAnim, { toValue: 0,        duration, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, [isResting, isHappy]);

  // Game tick
  useEffect(() => {
    tickInterval.current = setInterval(() => {
      if (!isResting) {
        setMutluluk(prev => Math.max(MIN_STAT, prev - 2));
        setAclik(prev => Math.max(MIN_STAT, prev - 1));
      }
    }, 3000);
    return () => clearInterval(tickInterval.current);
  }, [isResting]);

  useEffect(() => () => {
    clearInterval(restInterval.current);
    clearInterval(tickInterval.current);
  }, []);

  const completeMiniGame = (type, score) => {
    if (type === 'catch') {
      if (score >= 5) unlockAchievement('catch_master');
      const newM = Math.min(MAX_STAT, mutluluk + score * 3);
      if (newM >= MAX_STAT) unlockAchievement('full_happy');
      setMutluluk(newM);
      setXp(prev => prev + score * 5);
      setCoins(prev => prev + score * 2);
    } else if (type === 'simon') {
      if (score >= 5) unlockAchievement('simon_master');
      setMutluluk(prev => Math.min(MAX_STAT, prev + score * 5));
      setXp(prev => prev + score * 10);
      setCoins(prev => prev + score * 5);
    } else if (type === 'math') {
      if (score === 5) unlockAchievement('math_genius');
      setMutluluk(prev => Math.min(MAX_STAT, prev + score * 10));
      setXp(prev => prev + score * 15);
      setCoins(prev => prev + score * 8);
    }
    setScreen('home');
  };

  const oyna = (activity) => {
    const newM = Math.min(MAX_STAT, mutluluk + activity.happinessGain);
    if (newM >= MAX_STAT) unlockAchievement('full_happy');
    setMutluluk(newM);
    setAclik(prev => Math.max(MIN_STAT, prev - PLAY_HUNGER_COST));
    setEnerji(prev => Math.max(MIN_STAT, prev - activity.energyCost));
    setXp(prev => prev + activity.xp);
    setCoins(prev => prev + activity.coins);
    setScreen('home');
  };

  const besle = (food) => {
    unlockAchievement('first_feed');
    setAclik(prev => Math.min(MAX_STAT, prev + food.hunger));
    setXp(prev => prev + FEED_XP);
    setScreen('home');
  };

  const dinlen = () => {
    setIsResting(true);
    restInterval.current = setInterval(() => {
      setEnerji(prev => {
        const next = Math.min(MAX_STAT, prev + REST_ENERGY_PER_SEC);
        if (next >= MAX_STAT) { clearInterval(restInterval.current); setIsResting(false); }
        return next;
      });
    }, 1000);
  };

  const uyandir = () => { clearInterval(restInterval.current); setIsResting(false); };

  // ── Achievements Screen ────────────────────────────────────
  if (screen === 'achievements') {
    return (
      <View style={styles.card}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => setScreen('home')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← GERİ</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>🏆 ROZETLER</Text>
        </View>
        <Text style={styles.achCount}>{achievements.size} / {ACHIEVEMENTS.length} kazanıldı</Text>
        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = achievements.has(a.id);
            return (
              <View key={a.id} style={[styles.achItem, !unlocked && styles.achItemLocked]}>
                <Text style={styles.achItemIcon}>{unlocked ? a.icon : '🔒'}</Text>
                <View style={styles.achItemInfo}>
                  <Text style={[styles.achItemLabel, !unlocked && { color: COLORS.textDim }]}>
                    {unlocked ? a.label : '???'}
                  </Text>
                  <Text style={styles.achItemDesc}>{unlocked ? a.desc : 'Henüz kazanılmadı'}</Text>
                </View>
                {unlocked && <Text style={styles.achItemCheck}>✓</Text>}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // ── Mini-Game Screens ──────────────────────────────────────
  if (screen === 'game_catch') {
    return (
      <View style={styles.card}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => setScreen('play')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← GERİ</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>🐟 BALIK YAKALA</Text>
        </View>
        <CatchGame onComplete={(s) => completeMiniGame('catch', s)} />
      </View>
    );
  }

  if (screen === 'game_simon') {
    return (
      <View style={styles.card}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => setScreen('play')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← GERİ</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>🎨 SİMON SÖYLEDİ</Text>
        </View>
        <SimonGame onComplete={(s) => completeMiniGame('simon', s)} />
      </View>
    );
  }

  if (screen === 'game_math') {
    return (
      <View style={styles.card}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => setScreen('play')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← GERİ</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>➕ HIZLI MATEMATİK</Text>
        </View>
        <MathGame onComplete={(s) => completeMiniGame('math', s)} />
      </View>
    );
  }

  // ── Activity Screen ────────────────────────────────────────
  if (screen === 'play') {
    return (
      <View style={styles.card}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => setScreen('home')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← GERİ</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>
            {isBored ? '😴 SIKILDI! EĞLENELIM' : 'OYUN ALANI 🎮'}
          </Text>
        </View>
        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
          {/* Mini-Games Section */}
          <Text style={styles.sectionTitle}>🕹 MİNİ OYUNLAR</Text>
          <View style={styles.miniGameRow}>
            <TouchableOpacity style={styles.miniGameCard} onPress={() => setScreen('game_catch')} activeOpacity={0.75}>
              <Text style={styles.miniGameEmoji}>🐟</Text>
              <Text style={styles.miniGameLabel}>Balık{'\n'}Yakala</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniGameCard} onPress={() => setScreen('game_simon')} activeOpacity={0.75}>
              <Text style={styles.miniGameEmoji}>🎨</Text>
              <Text style={styles.miniGameLabel}>Simon{'\n'}Söyledi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniGameCard} onPress={() => setScreen('game_math')} activeOpacity={0.75}>
              <Text style={styles.miniGameEmoji}>➕</Text>
              <Text style={styles.miniGameLabel}>Hızlı{'\n'}Matematik</Text>
            </TouchableOpacity>
          </View>

          {/* Activities Section */}
          <Text style={styles.sectionTitle}>🏃 AKTİVİTELER</Text>
          {ACTIVITIES.map((act) => (
            <View key={act.label} style={styles.activityItem}>
              <Image source={act.image} style={styles.activityImage} resizeMode="cover" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityLabel}>{act.label}</Text>
                <Text style={styles.activityStats}>⚡-{act.energyCost}  😊+{act.happinessGain}</Text>
                <Text style={styles.activityReward}>+{act.xp} XP  🪙+{act.coins}</Text>
              </View>
              <PixelButton
                label="OYNA"
                onPress={() => oyna(act)}
                color={COLORS.btnPlay}
                disabled={enerji < act.energyCost}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Food Screen ───────────────────────────────────────────
  if (screen === 'feed') {
    return (
      <View style={styles.card}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => setScreen('home')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← GERİ</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>YEMEK DOLABI 🍽️</Text>
        </View>
        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
          <View style={styles.foodGrid}>
            {FOODS.map((food) => (
              <TouchableOpacity
                key={food.label}
                style={[styles.foodCard, aclik >= MAX_STAT && styles.foodCardDisabled]}
                onPress={() => besle(food)}
                disabled={aclik >= MAX_STAT}
                activeOpacity={0.75}
              >
                <Image source={food.image} style={styles.foodImage} resizeMode="cover" />
                <Text style={styles.foodLabel}>{food.label}</Text>
                <Text style={styles.foodHunger}>+{food.hunger} 🍖</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Home Screen ───────────────────────────────────────────
  return (
    <View style={styles.card}>
      <AchievementBanner achievement={achPopup} />
      <View style={styles.headerRow}>
        <Text style={styles.levelText}>Lv: {level}</Text>
        <Text style={styles.cardTitle}>[ {isim.toUpperCase()} ]</Text>
        <TouchableOpacity onPress={() => setScreen('achievements')} style={styles.trophyBtn}>
          <Text style={styles.trophyText}>{coins} 🪙</Text>
          <Text style={styles.trophyText}>🏆 {achievements.size}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.xpBarRow}>
        <Text style={styles.xpLabel}>XP</Text>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${xpProgress}%` }]} />
        </View>
        <Text style={styles.xpLabel}>{xpProgress}/{XP_PER_LEVEL}</Text>
      </View>

      <Text style={styles.cardSubtitle}>~ {tur} ~</Text>

      <ThoughtBubble
        aclik={aclik}
        mutluluk={mutluluk}
        enerji={enerji}
        isResting={isResting}
        onNavigate={setScreen}
      />

      <Animated.Image
        source={getSprite(aclik, mutluluk, enerji, isResting)}
        style={[styles.catImage, { transform: [{ translateY: idleAnim }] }]}
        resizeMode="contain"
      />

      <View style={styles.statsContainer}>
        <PixelBar label="TOKLUK  " value={aclik} />
        <PixelBar label="MUTLULUK" value={mutluluk} />
        <PixelBar label="ENERJI  " value={enerji} />
      </View>

      <View style={styles.buttonRow}>
        <PixelButton icon="🍗" label="BESLE"  onPress={() => setScreen('feed')} color={COLORS.btnFeed} disabled={isResting} />
        {isBored
          ? <PixelButton icon="🎉" label="NEŞELENDİR" onPress={() => setScreen('play')} color="#E67E22" disabled={isResting} />
          : <PixelButton icon="🎮" label="OYNA" onPress={() => setScreen('play')} color={COLORS.btnPlay} disabled={isResting || enerji <= 0} />
        }
        {isResting
          ? <PixelButton icon="☀️" label="UYANDIR" onPress={uyandir}  color={COLORS.btnFeed} />
          : <PixelButton icon="💤" label="DINLEN"  onPress={dinlen}   color={COLORS.btnRest} disabled={enerji >= MAX_STAT} />
        }
      </View>
    </View>
  );
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  const [fontsLoaded] = useFonts({ VT323_400Regular });
  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.appTitle}>★ TAMAGO ★</Text>
      <Card isim="Boncuk" tur="Kedi" />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontFamily: FONT,
    fontSize: 32,
    color: COLORS.border,
    letterSpacing: 4,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 3,
    borderColor: COLORS.border,
    borderRadius: 0,
    padding: 16,
    alignItems: 'center',
    width: '92%',
    maxHeight: '84%',
    shadowColor: COLORS.border,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },

  // ── Header ─────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelText: {
    fontFamily: FONT,
    fontSize: 20,
    color: COLORS.text,
  },
  coinsText: {
    fontFamily: FONT,
    fontSize: 20,
    color: COLORS.text,
  },
  cardTitle: {
    fontFamily: FONT,
    fontSize: 22,
    color: COLORS.text,
  },
  cardSubtitle: {
    fontFamily: FONT,
    fontSize: 16,
    color: COLORS.textDim,
    marginBottom: 6,
  },

  // ── XP Bar ─────────────────────────────────────────────────
  xpBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 6,
    marginBottom: 6,
  },
  xpLabel: {
    fontFamily: FONT,
    fontSize: 14,
    color: COLORS.textDim,
  },
  xpTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.barEmpty,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  xpFill: {
    height: '100%',
    backgroundColor: COLORS.xpFill,
  },

  // ── Thought Bubble ─────────────────────────────────────────
  bubble: {
    backgroundColor: COLORS.bubble,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  bubbleText: {
    fontFamily: FONT,
    fontSize: 20,
    color: COLORS.text,
  },
  bubbleZzz: {
    fontFamily: FONT,
    fontSize: 24,
    color: '#5D7EA8',
    letterSpacing: 4,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    width: 10,
    height: 10,
    backgroundColor: COLORS.bubble,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.border,
    transform: [{ rotate: '45deg' }],
  },

  // ── Cat ────────────────────────────────────────────────────
  catImage: {
    width: 140,
    height: 140,
    marginBottom: 10,
  },

  // ── Stats ──────────────────────────────────────────────────
  statsContainer: {
    width: '100%',
    marginBottom: 12,
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barLabel: {
    fontFamily: FONT,
    fontSize: 14,
    color: COLORS.text,
    width: 76,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: COLORS.border,
    height: 18,
    padding: 2,
    gap: 1,
  },
  barSegment: {
    flex: 1,
  },

  // ── Buttons ────────────────────────────────────────────────
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  pixelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderBottomWidth: 5,
    borderRightWidth: 4,
    gap: 2,
  },
  pixelBtnIcon: {
    fontSize: 22,
  },
  pixelBtnText: {
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.btnText,
  },

  // ── Screen Header ──────────────────────────────────────────
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
    gap: 10,
  },
  backBtn: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderBottomWidth: 4,
    borderRightWidth: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.bg,
  },
  backBtnText: {
    fontFamily: FONT,
    fontSize: 16,
    color: COLORS.text,
  },
  screenTitle: {
    fontFamily: FONT,
    fontSize: 20,
    color: COLORS.text,
    flex: 1,
  },

  // ── Section Title ──────────────────────────────────────────
  sectionTitle: {
    fontFamily: FONT,
    fontSize: 18,
    color: COLORS.textDim,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 4,
  },

  // ── Mini-Games Section ─────────────────────────────────────
  miniGameRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 14,
  },
  miniGameCard: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderBottomWidth: 4,
    borderRightWidth: 3,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  miniGameEmoji: {
    fontSize: 28,
  },
  miniGameLabel: {
    fontFamily: FONT,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
  },

  // ── Activity Screen ────────────────────────────────────────
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  activityImage: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  activityInfo: {
    flex: 1,
    gap: 2,
  },
  activityLabel: {
    fontFamily: FONT,
    fontSize: 20,
    color: COLORS.text,
  },
  activityStats: {
    fontFamily: FONT,
    fontSize: 14,
    color: COLORS.textDim,
  },
  activityReward: {
    fontFamily: FONT,
    fontSize: 14,
    color: '#8E44AD',
  },

  // ── Food Screen ────────────────────────────────────────────
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  foodCard: {
    width: '47%',
    backgroundColor: COLORS.bg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  foodCardDisabled: {
    opacity: 0.4,
  },
  foodImage: {
    width: 72,
    height: 72,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  foodLabel: {
    fontFamily: FONT,
    fontSize: 16,
    color: COLORS.text,
  },
  foodHunger: {
    fontFamily: FONT,
    fontSize: 14,
    color: COLORS.btnFeed,
  },

  // ── Mini-Game Shared ───────────────────────────────────────
  gameIntro: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  gameIntroEmoji: {
    fontSize: 48,
  },
  gameIntroTitle: {
    fontFamily: FONT,
    fontSize: 22,
    color: COLORS.text,
    letterSpacing: 2,
  },
  gameIntroDesc: {
    fontFamily: FONT,
    fontSize: 17,
    color: COLORS.textDim,
    textAlign: 'center',
    lineHeight: 26,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    padding: 12,
    width: '100%',
  },
  gameContent: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 4,
  },
  gameStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  gameStat: {
    fontFamily: FONT,
    fontSize: 20,
    color: COLORS.text,
  },
  gameHint: {
    fontFamily: FONT,
    fontSize: 16,
    color: COLORS.textDim,
    marginBottom: 10,
  },
  gameResult: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  gameResultEmoji: {
    fontSize: 52,
  },
  gameResultText: {
    fontFamily: FONT,
    fontSize: 28,
    color: COLORS.text,
  },
  gameResultSub: {
    fontFamily: FONT,
    fontSize: 18,
    color: '#8E44AD',
    marginBottom: 8,
  },

  // ── Catch Game ─────────────────────────────────────────────
  catchArea: {
    width: 280,
    height: 180,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: '#E8F4FD',
    position: 'relative',
  },
  fishBtn: {
    position: 'absolute',
    padding: 4,
  },
  fishEmoji: {
    fontSize: 28,
  },

  // ── Simon Game ─────────────────────────────────────────────
  simonGrid: {
    width: 200,
    height: 200,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  simonBtn: {
    width: 96,
    height: 96,
    borderWidth: 3,
    borderColor: COLORS.border,
    borderRadius: 0,
  },

  // ── Math Game ──────────────────────────────────────────────
  mathQuestion: {
    fontFamily: FONT,
    fontSize: 36,
    color: COLORS.text,
    marginVertical: 16,
    textAlign: 'center',
  },
  mathFeedback: {
    fontFamily: FONT,
    fontSize: 20,
    marginBottom: 8,
  },
  mathChoices: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  mathChoice: {
    flex: 1,
    backgroundColor: COLORS.btnPlay,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderBottomWidth: 5,
    borderRightWidth: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  mathChoiceText: {
    fontFamily: FONT,
    fontSize: 24,
    color: COLORS.btnText,
    fontWeight: 'bold',
  },

  // ── Achievements Screen ────────────────────────────────────
  achCount: {
    fontFamily: FONT,
    fontSize: 16,
    color: COLORS.textDim,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  achItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.barGreen,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  achItemLocked: {
    borderLeftColor: COLORS.barEmpty,
    opacity: 0.6,
  },
  achItemIcon: {
    fontSize: 28,
    width: 36,
    textAlign: 'center',
  },
  achItemInfo: {
    flex: 1,
    gap: 2,
  },
  achItemLabel: {
    fontFamily: FONT,
    fontSize: 20,
    color: COLORS.text,
  },
  achItemDesc: {
    fontFamily: FONT,
    fontSize: 14,
    color: COLORS.textDim,
  },
  achItemCheck: {
    fontSize: 20,
    color: COLORS.barGreen,
    fontWeight: 'bold',
  },

  // ── Achievement Banner (popup) ─────────────────────────────
  achBanner: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderWidth: 3,
    borderColor: '#F39C12',
    borderRadius: 0,
    padding: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 12,
  },
  achBannerIcon: {
    fontSize: 32,
  },
  achBannerText: {
    flex: 1,
  },
  achBannerTitle: {
    fontFamily: FONT,
    fontSize: 14,
    color: '#9A6107',
  },
  achBannerLabel: {
    fontFamily: FONT,
    fontSize: 20,
    color: COLORS.text,
  },

  // ── Trophy Button (header) ─────────────────────────────────
  trophyBtn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  trophyText: {
    fontFamily: FONT,
    fontSize: 16,
    color: COLORS.text,
  },
});
