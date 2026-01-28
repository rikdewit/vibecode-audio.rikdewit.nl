
import React, { useState, useCallback, useMemo } from 'react';
import { Send, CheckCircle2, ArrowRight, ArrowLeft, Check, Mail, Phone, MessageSquare } from 'lucide-react';

// --- Types ---
type StepId = 
  | 'main' 
  | 'live-type' | 'live-hire-role' | 'live-hire-details' 
  | 'live-event-type' | 'live-music-check' | 'speakers-only' 
  | 'performers' | 'instruments' | 'location-equipment' | 'location-name' | 'live-practical'
  | 'studio-type' | 'studio-details'
  | 'nabewerking-type' | 'nabewerking-details'
  | 'advies-who' | 'advies-goal' | 'advies-ruimte' | 'advies-doel' | 'advies-methode'
  | 'advies-gebruik' | 'advies-kopen-details' | 'advies-kopen-type'
  | 'anders-beschrijving'
  | 'contact' | 'success';

interface FormData {
  [key: string]: any;
}

const OnboardingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<StepId>('main');
  const [formData, setFormData] = useState<FormData>({
    'contact-pref': 'email'
  });
  const [stepHistory, setStepHistory] = useState<StepId[]>(['main']);
  const [isAnimating, setIsAnimating] = useState(false);

  const progress = useMemo(() => {
    if (currentStep === 'success') return 100;
    if (currentStep === 'contact') return 95;
    const stepWeight = 8;
    const calculated = 10 + (stepHistory.length * stepWeight);
    return Math.min(calculated, 90);
  }, [stepHistory, currentStep]);

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/.test(phone);

  const isContactStepValid = useMemo(() => {
    const name = formData['contact-name'] || '';
    const email = formData['contact-email'] || '';
    const phone = formData['contact-phone'] || '';
    return name.trim().length > 1 && validateEmail(email) && validatePhone(phone);
  }, [formData]);

  const determineNextStep = useCallback((step: StepId): StepId | null => {
    if (step === 'main') {
      const service = formData['main-service'];
      if (service === 'live') return 'live-type';
      if (service === 'studio') return 'studio-type';
      if (service === 'nabewerking') return 'nabewerking-type';
      if (service === 'advies') return 'advies-who';
      if (service === 'anders') return 'anders-beschrijving';
    }

    if (step === 'live-type') {
      const liveType = formData['live-type'];
      return liveType === 'hire' ? 'live-hire-role' : 'live-event-type';
    }

    if (step === 'live-hire-role') return 'live-hire-details';
    if (step === 'live-hire-details') return 'contact';

    if (step === 'live-event-type') {
      const eventType = formData['event-type'];
      return eventType === 'concert' || eventType === 'Concert / Festival' ? 'performers' : 'live-music-check';
    }

    if (step === 'live-music-check') {
      // Logic: "Nee" skips speakers and goes straight to equipment.
      return formData['has-live-music'] === 'ja' ? 'performers' : 'location-equipment';
    }

    if (step === 'speakers-only') return 'location-equipment';
    if (step === 'performers') {
      const p = formData['performers'];
      return (p === 'Band (2-5 personen)' || p === 'Band (6+ personen)' || p === 'band-small' || p === 'band-large') ? 'instruments' : 'location-equipment';
    }
    if (step === 'instruments') return 'location-equipment';
    if (step === 'location-equipment') {
      return formData['equip-weet-niet'] || formData['equip-Weet ik niet'] ? 'location-name' : 'live-practical';
    }
    if (step === 'location-name') return 'live-practical';
    if (step === 'live-practical') return 'contact';

    if (step === 'studio-type') return 'studio-details';
    if (step === 'studio-details') return 'contact';

    if (step === 'nabewerking-type') return 'nabewerking-details';
    if (step === 'nabewerking-details') return 'contact';

    // --- Audio Advies Logic ---
    if (step === 'advies-who') return 'advies-goal';
    if (step === 'advies-goal') {
      const goal = formData['advies-goal'];
      if (goal === 'event') return 'live-event-type';
      if (goal === 'verbeteren') return 'advies-ruimte';
      if (goal === 'aanschaffen') return 'advies-gebruik';
      if (goal === 'anders') return 'anders-beschrijving';
    }
    if (step === 'advies-ruimte') return 'advies-doel';
    if (step === 'advies-doel') return 'advies-methode';
    if (step === 'advies-methode') return 'contact';
    if (step === 'advies-gebruik') return 'advies-kopen-details';
    if (step === 'advies-kopen-details') return 'advies-kopen-type';
    if (step === 'advies-kopen-type') return 'contact';

    if (step === 'anders-beschrijving') return 'contact';
    if (step === 'contact') return 'success';

    return null;
  }, [formData]);

  const handleNext = () => {
    const next = determineNextStep(currentStep);
    if (next) {
      setIsAnimating(true);
      setTimeout(() => {
        setStepHistory(prev => [...prev, next]);
        setCurrentStep(next);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleBack = () => {
    if (stepHistory.length > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        const newHistory = [...stepHistory];
        newHistory.pop();
        setStepHistory(newHistory);
        setCurrentStep(newHistory[newHistory.length - 1]);
        setIsAnimating(false);
      }, 300);
    }
  };

  const OptionCard = ({ label, isSelected, onClick, icon: Icon }: any) => (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden p-5 border cursor-pointer transition-all duration-300 rounded-sm group
        ${isSelected ? 'border-black bg-white' : 'border-gray-100 bg-white hover:border-gray-400'}`}
    >
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-[#87E8A0]/10 to-[#71E2E4]/10 transition-all duration-500 ease-out
          ${isSelected ? 'w-full' : 'w-0 group-hover:w-full'}`} 
      />
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && <Icon size={18} strokeWidth={1.5} className={isSelected ? 'text-black' : 'text-gray-600'} />}
          <span className={`mono text-xs uppercase tracking-widest font-medium ${isSelected ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>
            {label}
          </span>
        </div>
        {isSelected && <Check size={16} className="text-black" />}
      </div>
    </div>
  );

  const CheckboxCard = ({ label, isSelected, onToggle }: any) => (
    <div 
      onClick={onToggle}
      className={`relative overflow-hidden p-4 border cursor-pointer transition-all duration-300 rounded-sm group
        ${isSelected ? 'border-black bg-white' : 'border-gray-100 bg-white hover:border-gray-300'}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-[#87E8A0]/5 to-[#71E2E4]/5 transition-all duration-500 ease-out
          ${isSelected ? 'w-full' : 'w-0 group-hover:w-full'}`} 
      />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-300
          ${isSelected ? 'bg-black border-black scale-110' : 'border-gray-300 bg-white'}`}>
          {isSelected && <Check size={12} className="text-white" />}
        </div>
        <span className={`mono text-[10px] uppercase tracking-widest font-medium transition-colors ${isSelected ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>
          {label}
        </span>
      </div>
    </div>
  );

  const NavButton = ({ onClick, disabled, variant = 'primary', children, fullWidth = false }: any) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 rounded-sm
        ${fullWidth ? 'w-full' : ''}
        ${variant === 'primary' 
          ? 'bg-black text-white hover:bg-black/90 disabled:bg-gray-200 disabled:text-gray-400' 
          : 'border border-gray-300 text-gray-500 hover:border-black hover:text-black bg-white'}`}
    >
      {variant === 'secondary' && <ArrowLeft size={14} />}
      {children}
      {variant === 'primary' && <ArrowRight size={14} />}
    </button>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'main':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Wat kan ik voor je betekenen?</h2>
            <div className="grid gap-3">
              {[
                { id: 'live', label: 'Live geluid voor een evenement' },
                { id: 'studio', label: 'Studio opname' },
                { id: 'nabewerking', label: 'Audio Nabewerking' },
                { id: 'advies', label: 'Audio Advies' },
                { id: 'anders', label: 'Anders' },
              ].map(opt => (
                <OptionCard key={opt.id} label={opt.label} isSelected={formData['main-service'] === opt.id} onClick={() => updateFormData('main-service', opt.id)} />
              ))}
            </div>
            <NavButton onClick={handleNext} disabled={!formData['main-service']}>Volgende</NavButton>
          </div>
        );

      case 'live-type':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Hoe kan ik je helpen?</h2>
            <div className="grid gap-3">
              <OptionCard label="Ik organiseer een evenement - help me de juiste keuzes maken" isSelected={formData['live-type'] === 'organize'} onClick={() => updateFormData('live-type', 'organize')} />
              <OptionCard label="Ik wil je direct inhuren voor een specifieke opdracht" isSelected={formData['live-type'] === 'hire'} onClick={() => updateFormData('live-type', 'hire')} />
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['live-type']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'live-hire-role':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Voor welke rol?</h2>
            <div className="grid gap-3">
              {['Geluidstechnicus live event', 'Stagehand / crew', 'Audio systeemontwerp', 'Mixing / mastering', 'Anders'].map(role => (
                <OptionCard key={role} label={role} isSelected={formData['hire-role'] === role} onClick={() => updateFormData('hire-role', role)} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['hire-role']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'live-hire-details':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Opdracht details</h2>
            <textarea 
              className="w-full border-b border-gray-300 py-4 focus:border-black outline-none transition-colors font-light resize-none min-h-[150px] bg-transparent text-black placeholder:text-gray-400" 
              placeholder="Beschrijf de opdracht: datum, locatie, budget..." 
              value={formData['hire-details'] || ''} 
              onChange={(e) => updateFormData('hire-details', e.target.value)} 
            />
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['hire-details']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'live-event-type':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Type event?</h2>
            <div className="grid gap-3">
              {['Concert / Festival', 'Bedrijfsevent', 'Privéfeest', 'Anders'].map(t => (
                <OptionCard key={t} label={t} isSelected={formData['event-type'] === t} onClick={() => updateFormData('event-type', t)} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['event-type']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'live-music-check':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Komt er live muziek?</h2>
            <div className="grid gap-3">
              <OptionCard label="Ja, live muziek" isSelected={formData['has-live-music'] === 'ja'} onClick={() => updateFormData('has-live-music', 'ja')} />
              <OptionCard label="Nee, alleen sprekers/presentatie" isSelected={formData['has-live-music'] === 'nee'} onClick={() => updateFormData('has-live-music', 'nee')} />
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['has-live-music']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'speakers-only':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Aantal sprekers?</h2>
            <input 
              type="number" 
              className="w-full border-b border-gray-300 py-4 focus:border-black outline-none transition-colors font-light bg-transparent text-black" 
              placeholder="Hoeveel microfoons zijn nodig?" 
              value={formData['num-speakers'] || ''} 
              onChange={(e) => updateFormData('num-speakers', e.target.value)} 
            />
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['num-speakers']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'performers':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Wie komt er optreden?</h2>
            <div className="grid gap-3">
              {['Solo artiest / DJ', 'Band (2-5 personen)', 'Band (6+ personen)', 'Meerdere acts'].map(p => (
                <OptionCard key={p} label={p} isSelected={formData['performers'] === p} onClick={() => updateFormData('performers', p)} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['performers']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'instruments':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Welke instrumenten?</h2>
            <div className="grid grid-cols-2 gap-3">
              {['Drums', 'Bas', 'Gitaar / Keys', 'Zang', 'Blazers', 'Anders'].map(i => (
                <CheckboxCard key={i} label={i} isSelected={formData[`instrument-${i}`]} onToggle={() => updateFormData(`instrument-${i}`, !formData[`instrument-${i}`])} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'location-equipment':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Wat is aanwezig op locatie?</h2>
            <div className="grid grid-cols-2 gap-3">
              {['PA Systeem', 'Monitors', 'Backline', 'Podium', 'Weet ik niet', 'Niks aanwezig'].map(e => (
                <CheckboxCard key={e} label={e} isSelected={formData[`equip-${e}`]} onToggle={() => updateFormData(`equip-${e}`, !formData[`equip-${e}`])} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'location-name':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Naam van de locatie?</h2>
            <input 
              type="text" 
              className="w-full border-b border-gray-300 py-4 focus:border-black outline-none transition-colors font-light bg-transparent text-black" 
              placeholder="Bijv. Paradiso Amsterdam" 
              value={formData['location-name'] || ''} 
              onChange={(e) => updateFormData('location-name', e.target.value)} 
            />
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['location-name']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'live-practical':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Praktische informatie</h2>
            <div className="grid gap-6">
               <div className="flex flex-col gap-1">
                 <label className="mono text-[10px] uppercase text-gray-600 font-bold tracking-widest">Datum</label>
                 <input 
                   type="date" 
                   className="border-b border-gray-300 py-3 focus:border-black outline-none font-light cursor-pointer bg-transparent text-black" 
                   value={formData['event-date'] || ''} 
                   onClick={(e) => (e.target as any).showPicker?.()}
                   onChange={e => updateFormData('event-date', e.target.value)} 
                 />
               </div>
               <div className="flex flex-col gap-1">
                 <label className="mono text-[10px] uppercase text-gray-600 font-bold tracking-widest">Locatie</label>
                 <input 
                    type="text" 
                    className="border-b border-gray-300 py-3 focus:border-black outline-none font-light bg-transparent text-black" 
                    placeholder="Stad, Straat of Locatienaam" 
                    value={formData['event-location'] || ''} 
                    onChange={e => updateFormData('event-location', e.target.value)} 
                 />
               </div>
               <div className="flex flex-col gap-1">
                 <label className="mono text-[10px] uppercase text-gray-600 font-bold tracking-widest">Aantal Bezoekers</label>
                 <input type="number" className="border-b border-gray-300 py-3 focus:border-black outline-none font-light bg-transparent text-black" value={formData['expected-visitors'] || ''} onChange={e => updateFormData('expected-visitors', e.target.value)} />
               </div>
               <div className="flex flex-col gap-1">
                 <label className="mono text-[10px] uppercase text-gray-600 font-bold tracking-widest">Bijzonderheden</label>
                 <textarea 
                   className="border-b border-gray-300 py-3 focus:border-black outline-none font-light min-h-[140px] resize-none bg-transparent text-black" 
                   placeholder="Overige wensen, technische bijzonderheden of specifieke tijden..." 
                   value={formData['event-details'] || ''} 
                   onChange={e => updateFormData('event-details', e.target.value)} 
                 />
               </div>
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'studio-type':
      case 'nabewerking-type':
        const opts = currentStep === 'studio-type' 
          ? ['Podcast opnemen', 'Live band opnemen', 'Voice over opnemen', 'Losse instrumenten opnemen', 'Anders']
          : ['Muziek mixen/masteren', 'Audiobewerking onder beeld', 'Podcast editing', 'Anders'];
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Wat zoek je precies?</h2>
            <div className="grid gap-3">
              {opts.map(o => (
                <OptionCard key={o} label={o} isSelected={formData[currentStep] === o} onClick={() => updateFormData(currentStep, o)} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData[currentStep]}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'studio-details':
      case 'nabewerking-details':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Vertel over je project</h2>
            <textarea 
              className="w-full border-b border-gray-300 py-4 focus:border-black outline-none transition-colors font-light resize-none min-h-[150px] bg-transparent text-black" 
              placeholder="Aantal tracks, deadline en visie..." 
              value={formData[currentStep] || ''} 
              onChange={(e) => updateFormData(currentStep, e.target.value)} 
            />
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData[currentStep]}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'advies-who':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Wie ben je?</h2>
            <div className="grid gap-3">
              {['Particulier', 'Band / Muzikant', 'Horeca / Locatie eigenaar', 'Bedrijf / Organisatie', 'Eventorganisator'].map(w => (
                <OptionCard key={w} label={w} isSelected={formData['advies-who'] === w} onClick={() => updateFormData('advies-who', w)} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['advies-who']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'advies-goal':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Waar heb je hulp bij nodig?</h2>
            <div className="grid gap-3">
              <OptionCard label="Geluid voor een specifiek event" isSelected={formData['advies-goal'] === 'event'} onClick={() => updateFormData('advies-goal', 'event')} />
              <OptionCard label="Mijn huidige geluid verbeteren" isSelected={formData['advies-goal'] === 'verbeteren'} onClick={() => updateFormData('advies-goal', 'verbeteren')} />
              <OptionCard label="Eigen apparatuur aanschaffen" isSelected={formData['advies-goal'] === 'aanschaffen'} onClick={() => updateFormData('advies-goal', 'aanschaffen')} />
              <OptionCard label="Anders / Weet nog niet" isSelected={formData['advies-goal'] === 'anders'} onClick={() => updateFormData('advies-goal', 'anders')} />
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['advies-goal']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'advies-ruimte':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Om wat voor ruimte gaat het?</h2>
            <div className="grid gap-3">
              {['Horeca / Winkel', 'Kantoor / Vergaderruimte', 'Muziekstudio', 'Thuis / Woonkamer', 'Anders'].map(r => (
                <OptionCard key={r} label={r} isSelected={formData['advies-ruimte'] === r} onClick={() => updateFormData('advies-ruimte', r)} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['advies-ruimte']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'advies-doel':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Wat is het doel?</h2>
            <div className="grid gap-3">
              {['Betere spraakverstaanbaarheid', 'Minder galm / echo', 'Geluidsisolatie', 'Betere beleving', 'Anders'].map(d => (
                <OptionCard key={d} label={d} isSelected={formData['advies-doel'] === d} onClick={() => updateFormData('advies-doel', d)} />
              ))}
            </div>
            {formData['advies-doel'] && (
              <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <textarea 
                  className="w-full border-b border-gray-300 py-4 focus:border-black outline-none transition-colors font-light resize-none min-h-[100px] bg-transparent text-black" 
                  placeholder="Omschrijf hier eventueel aanvullende doelen of wensen..." 
                  value={formData['advies-doel-details'] || ''} 
                  onChange={(e) => updateFormData('advies-doel-details', e.target.value)} 
                />
              </div>
            )}
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['advies-doel']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'advies-methode':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Vorm van advies?</h2>
            <div className="grid gap-3">
              {['Meting op locatie', 'Adviesrapport', 'Systeemontwerp', 'Gewoon even sparren'].map(m => (
                <OptionCard key={m} label={m} isSelected={formData['advies-methode'] === m} onClick={() => updateFormData('advies-methode', m)} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['advies-methode']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'advies-gebruik':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Waarvoor ga je het gebruiken?</h2>
            <div className="grid gap-3">
              {['Live optredens', 'Studio werk', 'Podcast / Content creation', 'Anders'].map(g => (
                <OptionCard key={g} label={g} isSelected={formData['advies-gebruik'] === g} onClick={() => updateFormData('advies-gebruik', g)} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['advies-gebruik']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'advies-kopen-details':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Details over aanschaf</h2>
            <textarea 
              className="w-full border-b border-gray-300 py-4 focus:border-black outline-none transition-colors font-light resize-none min-h-[150px] bg-transparent text-black" 
              placeholder="Budget? Specifieke eisen?" 
              value={formData['advies-kopen-details'] || ''} 
              onChange={(e) => updateFormData('advies-kopen-details', e.target.value)} 
            />
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['advies-kopen-details']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'advies-kopen-type':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Huren of kopen?</h2>
            <div className="grid gap-3">
              {['Ik wil het zelf aanschaffen', 'Huren op lange termijn', 'Nog niet zeker'].map(k => (
                <OptionCard key={k} label={k} isSelected={formData['advies-kopen-type'] === k} onClick={() => updateFormData('advies-kopen-type', k)} />
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['advies-kopen-type']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'anders-beschrijving':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Vertel wat je zoekt</h2>
            <textarea 
              className="w-full border-b border-gray-300 py-4 focus:border-black outline-none transition-colors font-light resize-none min-h-[200px] bg-transparent text-black" 
              placeholder="Beschrijf je vraag of project..." 
              value={formData['anders-beschrijving'] || ''} 
              onChange={(e) => updateFormData('anders-beschrijving', e.target.value)} 
            />
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <NavButton onClick={handleNext} disabled={!formData['anders-beschrijving']}>Volgende</NavButton>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-light tracking-tight text-black">Contactgegevens</h2>
            <div className="grid gap-6">
              <div className="flex flex-col gap-2">
                <label className="mono text-[10px] uppercase text-gray-600 font-bold tracking-widest">Volledige Naam *</label>
                <input type="text" className="border-b border-gray-300 py-3 focus:border-black outline-none font-light transition-colors bg-transparent text-black" placeholder="bijv. Jan de Vries" value={formData['contact-name'] || ''} onChange={e => updateFormData('contact-name', e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="mono text-[10px] uppercase text-gray-600 font-bold tracking-widest">E-mail *</label>
                  <input type="email" className="border-b border-gray-300 py-3 focus:border-black outline-none font-light transition-colors bg-transparent text-black" placeholder="jan@voorbeeld.nl" value={formData['contact-email'] || ''} onChange={e => updateFormData('contact-email', e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="mono text-[10px] uppercase text-gray-600 font-bold tracking-widest">Telefoon *</label>
                  <input type="tel" className="border-b border-gray-300 py-3 focus:border-black outline-none font-light transition-colors bg-transparent text-black" placeholder="+31 6 ..." value={formData['contact-phone'] || ''} onChange={e => updateFormData('contact-phone', e.target.value)} />
                </div>
              </div>
              
              <div className="flex flex-col gap-4 mt-4">
                <label className="mono text-[10px] uppercase text-gray-600 font-bold tracking-widest">Voorkeur Contactmethode</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'email', label: 'E-mail', icon: Mail },
                    { id: 'telefoon', label: 'Bellen', icon: Phone },
                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => updateFormData('contact-pref', opt.id)}
                      className={`relative overflow-hidden flex flex-col items-center justify-center p-4 border cursor-pointer transition-all rounded-sm gap-2 group
                        ${formData['contact-pref'] === opt.id ? 'border-black bg-white' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r from-[#87E8A0]/10 to-[#71E2E4]/10 transition-all duration-500 ease-out
                        ${formData['contact-pref'] === opt.id ? 'w-full' : 'w-0 group-hover:w-full'}`} 
                      />
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <opt.icon size={18} className={formData['contact-pref'] === opt.id ? 'text-black' : 'text-gray-400'} />
                        <span className={`mono text-[9px] uppercase tracking-widest font-bold ${formData['contact-pref'] === opt.id ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>{opt.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <NavButton variant="secondary" onClick={handleBack}>Terug</NavButton>
              <button 
                onClick={handleNext} 
                disabled={!isContactStepValid}
                className="flex-grow bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] disabled:bg-gray-200 flex items-center justify-center gap-3 transition-all hover:bg-black/90"
              >
                Aanvraag Verzenden <Send size={14} />
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12 space-y-8 animate-in zoom-in duration-700">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-black mb-4">
              <CheckCircle2 className="text-[#87E8A0]" size={48} strokeWidth={1} />
            </div>
            <h2 className="text-4xl font-light tracking-tight text-black">Aanvraag Ontvangen</h2>
            <p className="text-gray-600 font-light max-w-md mx-auto leading-relaxed">
              Bedankt voor het invullen van de briefing. Ik neem binnen 24 uur contact met je op om de details te bespreken.
            </p>
            <button 
              onClick={() => { setFormData({'contact-pref': 'email'}); setCurrentStep('main'); setStepHistory(['main']); }}
              className="text-[10px] font-bold tracking-[0.3em] uppercase underline underline-offset-8 text-black hover:text-gray-400 transition-colors"
            >
              Nieuwe aanvraag starten
            </button>
          </div>
        );

      default:
        return <div className="text-center py-20 text-black"><h2 className="text-xl font-light">Laden...</h2></div>;
    }
  };

  return (
    <section id="onboarding" className="py-24 md:py-32 px-6 bg-white overflow-hidden border-y border-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-16 lg:gap-24 items-start">
          
          {/* Left: Branding & Messaging */}
          <div className="lg:col-span-2 lg:sticky lg:top-32 flex flex-col justify-between">
            <div className="flex flex-col">
              <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-gray-500 mb-8">Briefing Tool</h2>
              <h3 className="text-4xl md:text-5xl font-light tracking-tighter leading-[1.05] mb-10 text-black">
                Klaar om je geluid naar een <span className="italic">hoger niveau</span> te tillen?
              </h3>
              <p className="text-gray-600 font-light text-lg mb-12 leading-relaxed max-w-md">
                Vul dit formulier in voor een vliegende start. Dit helpt mij om direct inzicht te krijgen in de technische eisen van jouw project.
              </p>

              <div className="flex flex-col gap-8 border-l border-gray-200 pl-8 mt-8 lg:mt-16">
                <div className={`transition-all duration-500 ${currentStep === 'main' ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                  <span className="mono text-[10px] block mb-1 text-gray-500">STAP 01</span>
                  <span className="text-sm font-medium tracking-wide uppercase text-black">Dienst Selectie</span>
                </div>
                <div className={`transition-all duration-500 ${currentStep !== 'main' && currentStep !== 'contact' && currentStep !== 'success' ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                  <span className="mono text-[10px] block mb-1 text-gray-500">STAP 02</span>
                  <span className="text-sm font-medium tracking-wide uppercase text-black">Technische Details</span>
                </div>
                <div className={`transition-all duration-500 ${currentStep === 'contact' ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                  <span className="mono text-[10px] block mb-1 text-gray-500">STAP 03</span>
                  <span className="text-sm font-medium tracking-wide uppercase text-black">Contact & Planning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Interactive Form */}
          <div className="lg:col-span-3">
            <div className="bg-gray-50 rounded-sm border border-gray-200 shadow-sm relative overflow-hidden min-h-[580px] flex flex-col">
              <div className="h-[2px] w-full bg-gray-200 relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#87E8A0] to-[#71E2E4] transition-all duration-700 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className={`p-8 md:p-12 lg:px-16 lg:pt-16 lg:pb-12 flex-grow transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {renderStepContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnboardingForm;
