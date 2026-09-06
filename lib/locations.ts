// Hama Nairobi location directory.
// Organized as commonly used neighbourhood / estate → local areas.
// Source basis: Nairobi's 17 constituencies and 85 wards, plus commonly used
// estate/locality names from current Nairobi location directories.
// This is intentionally editable because Nairobi has thousands of named
// apartment blocks and micro-neighbourhoods that are not captured by any single
// authoritative public list.

export const HOODS = {
  // WESTLANDS / PARKLANDS / KITISURU
  "Westlands": ["Sarit Centre Area","Rhapta Road","Brookside","School Lane","Waiyaki Way","Westlands Road","General Mathenge","Muthangari","Kibagare","Deep Sea"],
  "Parklands": ["1st Parklands Avenue","2nd Parklands Avenue","3rd Parklands Avenue","4th Parklands Avenue","5th Parklands Avenue","6th Parklands Avenue","Mpaka Road","Avenue Hospital Area","Highridge"],
  "Highridge": ["Masari Road","Diamond Plaza Area","Limuru Road","Highridge Shopping Centre","Parklands Border"],
  "Kangemi": ["Kangemi Market","Sodom","Mvuli Road","Mountain View Border","Waiyaki Way"],
  "Mountain View": ["Mountain View Estate","Lower Kabete Road","Muthangari Border","Kangemi Border"],
  "Kitisuru": ["New Kitisuru","Old Kitisuru","Mwimuto","Tate Close","Kitisuru Road"],
  "Loresho": ["Loresho Ridge","Loresho Estate","Kyuna","Kaptagat Road","Lower Kabete Border"],
  "Spring Valley": ["Spring Valley Crescent","Peponi Road","Spring Valley Extension","Muthangari Border"],
  "Gigiri": ["UN Avenue","Village Market Area","Warwick Centre Area","Rosslyn Border","Gigiri Drive"],
  "Karura": ["Karura Forest Area","Muthaiga North Border","Ridgeways Border"],
  "Runda": ["Old Runda","Runda Mimosa","Runda Meadows","Runda Evergreen","Runda Paradise","Runda Gate"],
  "Nyari": ["Nyari Estate","Nyari West","Rosslyn Border","Runda Border"],
  "Muthaiga": ["Muthaiga Road","Old Muthaiga","New Muthaiga","Muthaiga North","Muthaiga Square"],
  "Muthaiga North": ["Muthaiga North","Marurui Border","Garden Estate Border"],
  "Githogoro": ["Githogoro Village","Roysambu Border","Runda Border"],
  "Garden Estate": ["Garden Estate Road","Ridgeways","Marurui","Thome Border"],
  "Marurui": ["Marurui Road","Garden Estate Border","Thome Border"],

  // DAGORETTI NORTH
  "Kilimani": ["Yaya Centre Area","Dennis Pritt","Lenana Road","Chania Avenue","Wood Avenue","Argwings Kodhek","Hurlingham Border"],
  "Kileleshwa": ["Oloitoktok Road","Mandera Road","Gichugu Road","Tabere Crescent","Kileleshwa Crescent","Kasuku Centre"],
  "Hurlingham": ["Argwings Kodhek Road","Rose Avenue","Jabavu Road","Hurlingham Shopping Centre","Ring Road Kilimani"],
  "Lavington": ["Lavington Green","James Gichuru","Chalbi Drive","Olenguruone Avenue","Valley Arcade","Gitanga Road"],
  "Gatina": ["Gatina Market","Muthangari Drive","Riruta Border","Kawangware Border"],
  "Kawangware": ["Stage 56","Congo","Coast","Gatina","Kawangware 46","Kawangware Market","Kabiro Border"],
  "Kabiro": ["Kabiro","Riruta Border","Kawangware Border","Wanyee Road"],

  // DAGORETTI SOUTH
  "Dagoretti": ["Dagoretti Corner","Satellite","Kabiria","Wanyee","Mutuini Border"],
  "Mutuini": ["Mutuini","Dagoretti Corner Border","Waithaka Border"],
  "Ngando": ["Ngando Market","Ngando Road","Riruta Border","Mutuini Border"],
  "Riruta": ["Riruta Satellite","Kabiria Road","PCEA Area","Riruta Centre","Kikuyu Road Border"],
  "Uthiru": ["Uthiru Junction","Cooperation","Gichagi","Uthiru Market","Ruthimitu Border"],
  "Ruthimitu": ["Ruthimitu","Uthiru Border","Dagoretti South Border"],
  "Waithaka": ["Kwa Miti","Central Waithaka","Ndwaru Road","Waithaka Shopping Centre","Gitaru Border"],
  "Kinoo": ["Stage 87","Muthiga","Regen","Kinoo Market","Gitaru Road"],

  // LANGATA
  "Karen": ["Hardy","Miotoni","Bogani","Kerarapon","Windy Ridge","Karen Shopping Centre","Langata Road","Hardy Centre"],
  "Langata": ["NHC Houses","Phenom","Southlands","Onyonka","Langata Shopping Centre","Carnivore Area","Wilson Airport Border"],
  "Nairobi West": ["T-Mall Area","Gandhi Avenue","Kodi Road","Nairobi West Shopping Centre"],
  "Mugumoini": ["Mugumoini","Carnivore Area","Langata Border"],
  "South C": ["Bellevue","Five Star","Mugoya","Ole Sereni Area","South C Shopping Centre","Akila","Otiende Border"],
  "Nyayo Highrise": ["Nyayo Highrise","Otiende","Mugoya","South C Border"],
  "Otiende": ["Otiende Estate","South C Border","Nyayo Highrise Border"],

  // KIBRA
  "Kibera": ["Laini Saba","Lindi","Makina","Gatwekera","Kianda","Kisumu Ndogo","Siranga","Mashimoni","Soweto East","Soweto West"],
  "Laini Saba": ["Laini Saba","Railway","Kibera Drive"],
  "Lindi": ["Lindi","Olympic Border","Kibera Drive"],
  "Makina": ["Makina","Ayany","Woodley Border"],
  "Woodley": ["Joseph Kang'ethe","Golf Course","Jamhuri Border","Kenyatta Golf Course","Woodley Estate"],
  "Sarang'ombe": ["Sarang'ombe","Raila","Ayany","Kibera Drive"],
  "Ayany": ["Ayany Estate","Makina","Sarang'ombe Border"],

  // ROYSAMBU
  "Roysambu": ["TRM Area","Lumumba","Roysambu Gardens","Kamiti Road","Zimmerman Border","Githurai Border"],
  "Githurai": ["Githurai 44","Githurai 45","Mwihoko Border","Githurai Market"],
  "Githurai 44": ["Kwa Do","Climax","Sunrise","Jacaranda","Kiamumbi Border","Githurai 44 Market"],
  "Githurai 45": ["Progressive","Kona","Mwihoko Border","Roundabout Area","Githurai 45 Market"],
  "Kahawa": ["Kahawa Sukari","Kahawa Wendani","Kahawa West","Kahawa Station"],
  "Kahawa West": ["Railway","Kwa Ingo","Kamiti Corner","Congoni","Kahawa West Market"],
  "Kahawa Sukari": ["Avenue First to Seventh","Quickmart Area","Sukari Presbyterian","Kahawa Sukari Market"],
  "Kahawa Wendani": ["Maguna's Area","Matopeni","Clean Shelf Area","Kahawa Wendani Market"],
  "Zimmerman": ["Zimmerman Centre","Kasarani Border","TRM Border","Kiamumbi Road"],

  // KASARANI
  "Kasarani": ["Seasons","Car Wash","Clay City","Clayworks","TRM Drive","Hunters","Sunton","Sportsview","Maternity","Stima","Mwiki","Mwiki Terminus","Maji Mazuri","Gitari Marigo","Kwa DC","Tumaini","Warren","Kasarani-Mwiki Road","Clay City Centre"],
  "Mwiki": ["Mwiki Town","Mwiki Terminus","Mwiki Stage","Mwiki Road","Mwiki Estate","Maji Mazuri"],
  "Clay City": ["Clay City Centre","Clay City Estate","Seasons Border","Mwiki Border"],
  "Njiru": ["Chokaa Border","St. Monica","Njiru Centre","Kwa Chief","Ruai Road"],
  "Ruai": ["Ruai Town","Shopping Centre","Sewage Area","Quickmart Area","Kamulu Road","Ruai Stage"],
  "Chokaa": ["Stage 1","Stage 2","Stage 3","Mwiki Road Link","Njiru Border"],
  "Kamulu": ["Kingoris","Stage 26","Kamulu Centre","Joska Road"],
  "Joska": ["Kantafu Border","Market Area","Joska Centre"],
  "Malaa": ["KBC Area","Gated Courts","Malaa Centre"],
  "Saika": ["Stage 29","Mwengenye","Saika Centre"],

  // RUARAKA
  "Ruaraka": ["Baba Dogo","Utalii","Mathare North","Lucky Summer","Garden City Area","Ruaraka Trading Centre"],
  "Baba Dogo": ["Baba Dogo Centre","Ruaraka Border","Lucky Summer Border"],
  "Utalii": ["Utalii College Area","Ruaraka Border","Thika Road"],
  "Mathare North": ["Mathare North","Baba Dogo Border","Lucky Summer Border"],
  "Lucky Summer": ["Lucky Summer Estate","Baba Dogo Border","Roysambu Border"],
  "Korogocho": ["Korogocho A","Korogocho B","Korogocho Central","Nyayo Village"],

  // EMBakasi SOUTH
  "Imara Daima": ["Villa Franca","Sunrise Estate","AA Area","Imara Daima Shopping Centre","Mombasa Road Border"],
  "Kwa Njenga": ["Kwa Njenga","Mukuru Kwa Njenga","Jairos","Kwa Reuben Border"],
  "Kwa Reuben": ["Kwa Reuben","Mukuru","Pipeline Border"],
  "Pipeline": ["Plot 10","Stage MP","Avenue Area","Pipeline Road","Outering Road"],
  "Kware": ["Kware","Kwa Reuben Border","Embakasi South Border"],

  // EMBAKASI NORTH
  "Kariobangi North": ["Kariobangi North","Light Industries","Dandora Border","Outer Ring Road"],
  "Dandora": ["Dandora Phase I","Dandora Phase II","Dandora Phase III","Dandora Phase IV","Dandora Phase V","Dump Site Area"],
  "Kariobangi": ["Kariobangi North","Kariobangi South","Civil Servants","Light Industries"],

  // EMBAKASI CENTRAL
  "Kayole": ["Kayole North","Kayole Central","Kayole South","Soweto","Jikaze","Masimba","Kayole Junction"],
  "Komarock": ["Sector 1","Sector 2","Sector 3","Sector 4","Komarock Heights","Komarock Centre"],
  "Matopeni": ["Matopeni Junction","Matopeni Estate","Kayole Border","Soweto Kayole"],
  "Saika Estate": ["Saika","Stage 29","Mwengenye","Kayole Border"],

  // EMBAKASI EAST
  "Embakasi": ["Embakasi Village","Embakasi Town","Nyayo Estate Border","Airport North Road"],
  "Utawala": ["GSU Stage","Benedicta","Shooters","Mihango","Utawala Centre","Embakasi East Border"],
  "Mihango": ["Mihango Centre","Utawala Border","Chokaa Road"],
  "Upper Savanna": ["Upper Savanna","Tena Border","Embakasi Border"],
  "Lower Savanna": ["Lower Savanna","Donholm Border","Embakasi Border"],
  "Donholm": ["Phase 1","Phase 2","Phase 3","Phase 4","Phase 5","Phase 6","Phase 7","Phase 8","Greenfields","Old Donholm","Donholm Shopping Centre"],
  "Greenspan": ["Greenspan Mall Area","Donholm Border","Tena Border"],
  "Tena": ["Tena Estate","Donholm Border","Umoja Border"],
  "Mowlem": ["Mowlem","Umoja Border","Kayole Border"],
  "Umoja": ["Umoja I","Umoja II","Innercore","Tena","Umoja Market"],

  // MAKADARA
  "Makadara": ["Hamza","Maringo","Jericho","Mbotela","Makongeni Border"],
  "Maringo": ["Maringo","Hamza","Jericho Border"],
  "Jericho": ["Ofafa Jericho","Jerusalem","Lumumba","Jericho Estate"],
  "Harambee": ["Harambee Estate","Makadara Border","Viwandani Border"],
  "Makongeni": ["Makongeni","Harambee Border","Bahati Border"],
  "Bahati": ["Bahati","Kaloleni Border","Jericho Border"],
  "Kaloleni": ["Kaloleni","Makongeni Border","Ofafa Border"],
  "Viwandani": ["Viwandani","Industrial Area Border","Makadara Border"],
  "South B": ["Plainsview","Golden Gate","Mariakani","South B Shopping Centre","Mukuru Border"],

  // KAMUKUNJI
  "Eastleigh": ["Section I","Section II","Section III","Eastleigh North","Eastleigh South","First Avenue","Second Avenue","Third Avenue","Twelfth Street","BBS Mall Area","Garissa Lodge Area"],
  "Pumwani": ["Pumwani","Majengo","Shauri Moyo Border","Gikomba Border"],
  "California": ["California Estate","Eastleigh Border","Pumwani Border"],
  "Shauri Moyo": ["Shauri Moyo","Pumwani Border","Eastleigh Border"],
  "Majengo": ["Majengo","Gikomba Border","Pumwani Border"],
  "Gikomba": ["Gikomba Market Area","Eastleigh Border","Pumwani Border"],
  "Airbase": ["Airbase","Eastleigh North Border","Kamukunji Border"],
  "Biafra": ["Biafra Estate","Eastleigh Border","Pangani Border"],
  "Mlango Kubwa": ["Mlango Kubwa","Mathare Border","Eastleigh Border"],

  // STAREHE / CBD / NGARA
  "Nairobi Central": ["CBD","City Centre","River Road","Tom Mboya Street","Moi Avenue","Kimathi Street","Kenyatta Avenue"],
  "Landimawe": ["Landimawe","South C Border","Industrial Area Border"],
  "Ngara": ["Kolobot Road","Kenya-Re","Fig Tree Area","Ngara Market","Forest Road","Pangani Border"],
  "Pangani": ["Pangani","Agoi Road","Fairview Road","Pangani Shopping Centre","Ngara Border"],
  "Ziwani": ["Ziwani","Kariokor","Ngara Border","Bahati Border"],
  "Kariokor": ["Kariokor Market","Pangani Border","Ngara Border","Ziwani Border"],
  "Race Course": ["Race Course","Ngara Border","Mathare North Border"],
  "Hospital Hill": ["Hospital Hill","Parklands Border","Ngara Border"],
  "Muthurwa": ["Market Area","Railway Quarters","Muthurwa Market"],
  "Jamhuri": ["Jamhuri Phase I","Jamhuri Phase II","Askari Estate","Woodley Border"],
  "Milimani": ["State House Road","Ralph Bunche Road","Valley Road Area","Hurlingham Border"],
  "Upper Hill": ["Hospital Road","Elgon Road","Kilimanjaro Avenue","Mara Road","Britam Area","Community Area"],

  // MATHARE
  "Mathare": ["Mathare Area 1","Mathare Area 2","Mathare Area 3","Mathare Area 4A","Mathare Valley","Number 10","Bondeni","Hospital Border"],
  "Huruma": ["Corner","Kiamaiko","Madoya","Huruma Market","Mathare Border"],
  "Mabatini": ["Mabatini","Mathare Border","Huruma Border"],
  "Ngei": ["Ngei","Huruma Border","Mathare North Border"],
  "Hospital": ["Mathare Hospital Area","Mathare Valley","Mathare North Border"],
  "Kiamaiko": ["Kiamaiko","Huruma","Eastleigh Border"],

  // OTHER COMMON NAIROBI NEIGHBOURHOODS / ESTATES
  "Madaraka": ["Strathmore Area","Madaraka Estate","Naivasha Road Border","Langata Road"],
  "Muthangari": ["Muthangari","James Gichuru","Riverside Border","Lavington Border"],
  "Riverside": ["Riverside Drive","Riverside Square","Kileleshwa Border","Westlands Border"],
  "Mukuru": ["Mukuru Kwa Njenga","Mukuru Kwa Reuben","Industrial Area Border","Pipeline Border"],

  // SATELLITE / NAIROBI METRO AREAS ALREADY USED IN THE PROTOTYPE
  "Syokimau": ["Syokimau Town","Gateway Mall Area","Katani Road","Mombasa Road"],
  "Mlolongo": ["Mlolongo Town","Athi River Road","Mombasa Road"],
  "Athi River": ["EPZ Area","Athi River Town","Greatwall","Mavoko"],
  "Ongata Rongai": ["Maasai Mall Area","Rimpa","Kware","Nkoroi","Tuala Border"],
  "Kiserian": ["Kiserian Town","Pipeline Area","Ngong Road Border"],
  "Ngong": ["Kibiko","Matasia","Ngong Town","Bulbul","Vetland"],
  "Kitengela": ["Kitengela Town","Milimani","Acacia","Chuna","New Valley","Greatwall"],
  "Ruiru": ["Membley","Kimbo","Kahawa Sukari Border","Ruiru Town","Githurai Border"],
  "Juja": ["Juja Farm","Witeithie","Juja Town","Kalimoni"],
  "Thika": ["Section 9","Landless","Makongeni Thika","Ngoigwa","Thika Town"],
} as const;
