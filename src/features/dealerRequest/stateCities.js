// GST state codes + the cities that belong to each state.
// City dropdown on the New Dealer Request page is filtered from STATE_CITIES using the selected state name.
// The list is the major towns per state; the form also offers "Other" so a dealer in a smaller town is never blocked.

export const GST_STATE_CODES = [
  { code: '01', name: 'JAMMU AND KASHMIR' },
  { code: '02', name: 'HIMACHAL PRADESH' },
  { code: '03', name: 'PUNJAB' },
  { code: '04', name: 'CHANDIGARH' },
  { code: '05', name: 'UTTARAKHAND' },
  { code: '06', name: 'HARYANA' },
  { code: '07', name: 'DELHI' },
  { code: '08', name: 'RAJASTHAN' },
  { code: '09', name: 'UTTAR PRADESH' },
  { code: '10', name: 'BIHAR' },
  { code: '11', name: 'SIKKIM' },
  { code: '12', name: 'ARUNACHAL PRADESH' },
  { code: '13', name: 'NAGALAND' },
  { code: '14', name: 'MANIPUR' },
  { code: '15', name: 'MIZORAM' },
  { code: '16', name: 'TRIPURA' },
  { code: '17', name: 'MEGHALAYA' },
  { code: '18', name: 'ASSAM' },
  { code: '19', name: 'WEST BENGAL' },
  { code: '20', name: 'JHARKHAND' },
  { code: '21', name: 'ODISHA' },
  { code: '22', name: 'CHATTISGARH' },
  { code: '23', name: 'MADHYA PRADESH' },
  { code: '24', name: 'GUJARAT' },
  { code: '26', name: 'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU' },
  { code: '27', name: 'MAHARASHTRA' },
  { code: '28', name: 'ANDHRA PRADESH' },
  { code: '29', name: 'KARNATAKA' },
  { code: '30', name: 'GOA' },
  { code: '31', name: 'LAKSHADWEEP' },
  { code: '32', name: 'KERALA' },
  { code: '33', name: 'TAMIL NADU' },
  { code: '34', name: 'PUDUCHERRY' },
  { code: '35', name: 'ANDAMAN AND NICOBAR ISLANDS' },
  { code: '36', name: 'TELANGANA' },
  { code: '37', name: 'ANDHRA PRADESH (NEW)' },
  { code: '38', name: 'LADAKH' },
];

const ANDHRA = [
  'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa',
  'Anantapur', 'Eluru', 'Ongole', 'Machilipatnam', 'Srikakulam', 'Vizianagaram', 'Chittoor', 'Proddatur', 'Nandyal',
  'Hindupur', 'Bhimavaram', 'Tenali', 'Madanapalle', 'Adoni', 'Dharmavaram', 'Gudivada',
];

export const STATE_CITIES = {
  'JAMMU AND KASHMIR': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur', 'Punch', 'Rajouri', 'Kupwara', 'Budgam', 'Pulwama', 'Samba'],
  'HIMACHAL PRADESH': ['Shimla', 'Solan', 'Dharamshala', 'Mandi', 'Baddi', 'Nahan', 'Palampur', 'Kullu', 'Hamirpur', 'Una', 'Bilaspur', 'Chamba', 'Paonta Sahib', 'Parwanoo', 'Manali'],
  PUNJAB: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Batala', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Firozpur', 'Kapurthala', 'Zirakpur', 'Rajpura', 'Sangrur', 'Faridkot', 'Fatehgarh Sahib', 'Gurdaspur'],
  CHANDIGARH: ['Chandigarh'],
  UTTARAKHAND: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Kotdwara', 'Ramnagar', 'Pithoragarh', 'Almora', 'Nainital', 'Mussoorie', 'Sitarganj', 'Srinagar (Garhwal)', 'Bazpur', 'Kichha'],
  HARYANA: ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal', 'Rewari', 'Narnaul', 'Pundri', 'Kosli', 'Palwal', 'Hansi', 'Fatehabad', 'Mahendragarh', 'Charkhi Dadri', 'Nuh', 'Jhajjar', 'Manesar', 'Dharuhera', 'Barwala'],
  DELHI: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Karol Bagh', 'Lajpat Nagar', 'Janakpuri', 'Pitampura', 'Saket', 'Najafgarh', 'Narela', 'Shahdara', 'Okhla', 'Mayapuri', 'Nehru Place', 'Vasant Kunj'],
  RAJASTHAN: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Beawar', 'Hanumangarh', 'Dhaulpur', 'Tonk', 'Gangapur City', 'Sawai Madhopur', 'Churu', 'Jhunjhunu', 'Barmer', 'Chittorgarh', 'Bundi', 'Nagaur', 'Jaisalmer', 'Banswara', 'Dausa', 'Bhiwadi', 'Neemrana', 'Abu Road', 'Mount Abu'],
  'UTTAR PRADESH': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Greater Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Budaun', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Ayodhya', 'Maunath Bhanjan', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit', 'Barabanki', 'Mainpuri', 'Khurja', 'Gonda', 'Mau', 'Sultanpur', 'Azamgarh', 'Bijnor', 'Etah', 'Deoria', 'Basti', 'Ballia', 'Lalitpur', 'Kasganj', 'Muradnagar', 'Baraut', 'Shamli', 'Pratapgarh', 'Ghazipur', 'Chandausi'],
  BIHAR: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Bettiah', 'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj', 'Sitamarhi', 'Jamalpur', 'Jehanabad', 'Aurangabad', 'Lakhisarai', 'Samastipur', 'Madhubani', 'Araria', 'Supaul', 'Forbesganj'],
  SIKKIM: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Singtam', 'Rangpo', 'Jorethang', 'Ravangla'],
  'ARUNACHAL PRADESH': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Tezu', 'Ziro', 'Bomdila', 'Along', 'Changlang', 'Roing', 'Namsai', 'Khonsa'],
  NAGALAND: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon', 'Phek'],
  MANIPUR: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Ukhrul', 'Senapati'],
  MIZORAM: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Saiha'],
  TRIPURA: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailasahar', 'Belonia', 'Ambassa', 'Khowai'],
  MEGHALAYA: ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Baghmara', 'Williamnagar'],
  ASSAM: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Diphu', 'North Lakhimpur', 'Karimganj', 'Sivasagar', 'Goalpara', 'Barpeta', 'Golaghat', 'Mangaldoi', 'Haflong'],
  'WEST BENGAL': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Bolpur', 'Bangaon', 'Cooch Behar', 'Barasat', 'Kalyani', 'Barrackpore', 'Serampore', 'Santipur'],
  JHARKHAND: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar', 'Chirkunda', 'Jhumri Telaiya', 'Saunda', 'Sahibganj', 'Chaibasa', 'Dumka', 'Lohardaga', 'Gumla', 'Pakur'],
  ODISHA: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Balangir', 'Jharsuguda', 'Jeypore', 'Bargarh', 'Rayagada', 'Angul', 'Dhenkanal', 'Kendujhar', 'Paradip', 'Koraput', 'Jajpur', 'Talcher', 'Brahmapur'],
  CHATTISGARH: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Dhamtari', 'Chirmiri', 'Mahasamund', 'Kawardha', 'Kanker', 'Bhatapara'],
  'MADHYA PRADESH': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur', 'Hoshangabad', 'Itarsi', 'Sehore', 'Betul', 'Seoni', 'Datia', 'Nagda', 'Dhar', 'Balaghat', 'Mhow'],
  GUJARAT: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch', 'Mehsana', 'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Vapi', 'Gondal', 'Veraval', 'Godhra', 'Patan', 'Kalol', 'Dahod', 'Botad', 'Amreli', 'Deesa', 'Jetpur', 'Ankleshwar', 'Himmatnagar', 'Gandhidham', 'Mundra', 'Sanand'],
  'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU': ['Silvassa', 'Daman', 'Diu', 'Amli', 'Naroli'],
  MAHARASHTRA: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kalyan', 'Dombivli', 'Vasai-Virar', 'Navi Mumbai', 'Pimpri-Chinchwad', 'Amravati', 'Kolhapur', 'Sangli', 'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna', 'Ambarnath', 'Bhiwandi', 'Panvel', 'Satara', 'Beed', 'Yavatmal', 'Nanded', 'Wardha', 'Gondia', 'Ratnagiri', 'Osmanabad', 'Nandurbar', 'Bhandara', 'Buldhana', 'Hingoli', 'Washim', 'Baramati', 'Karad', 'Shirdi', 'Lonavala', 'Mira-Bhayandar', 'Ulhasnagar', 'Kharghar'],
  'ANDHRA PRADESH': ANDHRA,
  KARNATAKA: ['Bengaluru', 'Mysuru', 'Hubballi', 'Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Gadag', 'Udupi', 'Robertsonpet', 'Bhadravati', 'Chitradurga', 'Kolar', 'Mandya', 'Chikkamagaluru', 'Gangavati', 'Bagalkot', 'Ranebennuru', 'Harihar', 'Yelahanka', 'Hosur', 'Chikkaballapur', 'Madikeri', 'Karwar', 'Sirsi'],
  GOA: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim', 'Valpoi', 'Pernem', 'Canacona'],
  LAKSHADWEEP: ['Kavaratti', 'Agatti', 'Minicoy', 'Amini', 'Andrott', 'Kalpeni'],
  KERALA: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Alappuzha', 'Palakkad', 'Kottayam', 'Kannur', 'Kasaragod', 'Malappuram', 'Manjeri', 'Thalassery', 'Ponnani', 'Vatakara', 'Kanhangad', 'Payyannur', 'Koyilandy', 'Kayamkulam', 'Neyyattinkara', 'Attingal', 'Changanassery', 'Perinthalmanna', 'Tirur', 'Kodungallur', 'Guruvayur', 'Irinjalakuda', 'Muvattupuzha', 'Pathanamthitta', 'Idukki', 'Wayanad', 'Aluva', 'Angamaly', 'Perumbavoor'],
  'TAMIL NADU': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Kumarapalayam', 'Karaikkudi', 'Neyveli', 'Cuddalore', 'Kumbakonam', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Pudukkottai', 'Ambur', 'Nagapattinam', 'Namakkal', 'Virudhunagar', 'Krishnagiri', 'Dharmapuri', 'Pallavaram', 'Tambaram', 'Avadi', 'Ambattur', 'Perambalur', 'Theni', 'Ramanathapuram'],
  PUDUCHERRY: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Ozhukarai', 'Villianur'],
  'ANDAMAN AND NICOBAR ISLANDS': ['Port Blair', 'Diglipur', 'Mayabunder', 'Rangat', 'Car Nicobar', 'Havelock Island', 'Campbell Bay'],
  TELANGANA: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Kothagudem', 'Secunderabad', 'Sangareddy', 'Medak', 'Vikarabad', 'Wanaparthy', 'Bodhan', 'Kamareddy', 'Zaheerabad', 'Patancheru', 'Shamshabad'],
  'ANDHRA PRADESH (NEW)': ANDHRA,
  LADAKH: ['Leh', 'Kargil', 'Nubra', 'Zanskar', 'Drass'],
};

export const STATE_OPTIONS = GST_STATE_CODES.map((s) => ({ value: s.name, label: s.name }));

export const OTHER_CITY = '__OTHER__';

export const citiesForState = (stateName) => {
  const list = STATE_CITIES[(stateName || '').toUpperCase()] || [];
  return [...new Set(list)].sort((a, b) => a.localeCompare(b));
};

export const findStateByCode = (code) => GST_STATE_CODES.find((s) => s.code === code);
export const findStateByName = (name) => GST_STATE_CODES.find((s) => s.name === (name || '').toUpperCase());
