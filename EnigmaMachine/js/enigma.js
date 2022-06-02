const rotors = {
  I:    'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
  II:   'AJDKSIRUXBLHWTMCQGZNPYFVOE',
  III:  'BDFHJLCPRTXVZNYEIWGAKMUSQO',
  IV:   'ESOVPZJAYQUIRHXLNFTGKDCMWB',
  V:    'VZBRGITYUPSDNHLXAWMJQOFECK'
};

const reflectors = {
  A: 'EJMZALYXVBWFCRQUONTSPIKHGD',
  B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL'
}

const settings = {
  rotors: ['I', 'II', 'III'],
  reflector: 'B',
  offsets: [0, 0, 0],
  ring: [0, 0, 0],
  plugboard: []
};
/** @param {string} char */
function enigma(char) {
  if(!/^[a-z]$/i.test(char)) return null;
  k = char.toUpperCase().charCodeAt()-65;
  if(k<0||k>25) return null;

  for(let i=0;i<settings.rotors.length;i++) {
    settings.ring[i]++;
    if(settings.ring[i]<26) break;
    settings.ring[i] %= 26;
  }

  for(const pairs of settings.plugboard) {
    if(k === pairs.charCodeAt(0)-65) {
      k = pairs.charCodeAt(1)-65;
      break;
    } else if(k === pairs.charCodeAt(1)-65) {
      k = pairs.charCodeAt(0)-65;
      break;
    }
  }
  for(let i=0;i<settings.rotors.length;i++) {
    const rotor = rotors[settings.rotors[i]];
    k = rotor.charCodeAt((k+settings.ring[i]+settings.offsets[i])%26)-65;
  }
  k = reflectors[settings.reflector].charCodeAt(k)-65;
  for(let i=settings.rotors.length-1;i>=0;i--) {
    const rotor = rotors[settings.rotors[i]];
    k = (rotor.search(String.fromCharCode(k+65))+25*(settings.ring[i]+settings.offsets[i]))%26;
  }

  for(const pairs of settings.plugboard) {
    if(k === pairs.charCodeAt(0)-65) {
      k = pairs.charCodeAt(1)-65;
      break;
    } else if(k === pairs.charCodeAt(1)-65) {
      k = pairs.charCodeAt(0)-65;
      break;
    }
  }

  return String.fromCharCode(k%26+65);
}