
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Globe, 
  Save, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Coins,
  Map,
  Ruler,
  // Added missing Mail icon import
  Mail
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Settings: React.FC = () => {
  const { user, updateUser } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'regional'>('profile');
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Regional State
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [country, setCountry] = useState(user?.country || 'United States');
  const [measurementUnit, setMeasurementUnit] = useState<'Metric' | 'Imperial'>(user?.measurementUnit || 'Metric');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email });
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    updateUser({ password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRegionalSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ currency, country, measurementUnit });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <SettingsIcon className="text-blue-600" size={32}/> System Configuration
          </h1>
          <p className="text-slate-500 mt-1">Manage user preferences, global standards, and account security.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}
          >
            <User size={18}/> User Profile
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}
          >
            <Lock size={18}/> Admin Security
          </button>
          <button 
            onClick={() => setActiveTab('regional')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'regional' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}
          >
            <Globe size={18}/> Regional & Global
          </button>
          
          <div className="pt-8 mt-8 border-t border-slate-200">
             <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                   <CheckCircle2 size={14}/> Cloud-Sync Active
                </div>
             </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8 lg:p-12">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Profile Details</h3>
                <p className="text-slate-500 text-sm">Update your public name and administrative contact information.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                      type="email" 
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <Save size={18}/> Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Account Security</h3>
                <p className="text-slate-500 text-sm">Update your administrative password to keep the system secure.</p>
              </div>

              <form onSubmit={handleSecuritySave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                      type={showPass ? "text" : "password"} 
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      type="password" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4">
                  <AlertCircle className="text-amber-500 flex-shrink-0" size={24}/>
                  <p className="text-xs font-bold text-amber-700 leading-relaxed">
                    Choose a strong password with at least 8 characters, including symbols and numbers. This password controls full access to the ERP system.
                  </p>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <Lock size={18}/> Update System Security
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'regional' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800">Regional & Global Standards</h3>
                <p className="text-slate-500 text-sm">Set the currency, country, and measurement units for the entire organization.</p>
              </div>

              <form onSubmit={handleRegionalSave} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Map size={14}/> Primary Country</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 transition-all"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Pakistan</option>
                      <option>United Arab Emirates</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>Germany</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Coins size={14}/> Base Currency</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 transition-all"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="PKR">PKR (₨) - Pakistani Rupee</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Ruler size={14}/> Measurement Standard</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button" 
                      onClick={() => setMeasurementUnit('Metric')}
                      className={`p-6 rounded-3xl border text-center transition-all ${measurementUnit === 'Metric' ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <p className="text-lg font-black">Metric</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${measurementUnit === 'Metric' ? 'text-blue-100' : 'text-slate-300'}`}>KG, Meters, Liters</p>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setMeasurementUnit('Imperial')}
                      className={`p-6 rounded-3xl border text-center transition-all ${measurementUnit === 'Imperial' ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <p className="text-lg font-black">Imperial</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${measurementUnit === 'Imperial' ? 'text-blue-100' : 'text-slate-300'}`}>LBS, Inches, Gallons</p>
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <Save size={18}/> Apply Global Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
