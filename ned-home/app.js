(function(){'use strict';
var entities=[],rooms=[],selected=null,period=24,climateItems=[],sensorPrefs={};
try{sensorPrefs=JSON.parse(localStorage.getItem('ned-home-sensor-prefs')||'{}')||{}}catch(e){sensorPrefs={}}
function pref(id){if(sensorPrefs.hasOwnProperty(id))return sensorPrefs[id];return {show:false,place:'other'}}
function savePrefs(){try{localStorage.setItem('ned-home-sensor-prefs',JSON.stringify(sensorPrefs))}catch(e){}}

function E(id){return document.getElementById(id)}function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]})}
/* v2.18 Bulgarian name-day dates.
   Source: bg-name-days, Copyright 2026 Mariyan Yordanov, MIT.
   See NAME-DAYS-LICENSE.txt in repository. */
var NED_FIXED_NAMES={"1-1":"Васил|Василка|Василена|Василия|Васко|Ваня|Ванко|Ванеса|Васила|Василина","1-2":"Силвестър|Силвия|Силвана","1-4":"Апостол|Апостолка","1-6":"Йордан|Йорданка|Данчо|Данка|Данаил|Данаила|Божидар|Божидара|Божана|Божил|Божко|Богдан|Богдана|Богомил|Богомила|Богослав|Боян|Бояна","1-7":"Иван|Иванка|Ивана|Иво|Ивайло|Ивалина|Ивета|Ивелина|Ивона|Ваньо|Ванина|Янко|Янка|Яна|Янислав|Яница|Йоан|Йоана","1-9":"Стефан|Стефка|Стефания|Стефанка|Стефко|Стоян|Стоянка|Стойчо|Стойна|Стоил|Стоимен|Стоименка","1-17":"Антон|Антония|Тони|Тоня|Антонина","1-18":"Атанас|Атанаска|Наско|Наска|Нася|Танас|Танка|Таня|Тана","1-20":"Евтим|Евтимия","1-21":"Максим","1-25":"Григор|Григорий|Гриша","1-30":"Светлин|Светлана|Светла|Светослав|Светослава|Светозар|Светозара|Светломир|Светломира","1-14":"Нина|Нинка|Нино","1-31":"Кирчо","1-8":"Бабинка","1-12":"Татяна|Татянка|Таня","1-15":"Павел|Павлина","2-1":"Трифон|Трифонка|Лозан|Лозана|Лозка","2-2":"Симеон|Симеонка|Симона|Симо","2-5":"Агата|Агатка","2-6":"Вукол","2-10":"Харалампи|Харалан|Харизан|Харитон","2-11":"Влас|Власка|Влади","2-14":"Валентин|Валентина|Валя","2-17":"Теодор|Теодора|Тодор|Тодорка|Тодорин|Божидар|Божидара|Теди|Тео","2-24":"Влас|Власи","2-3":"Симеон|Анна|Ана","2-8":"Теодор|Теодора|Тодор|Тодорка","2-12":"Мелетий","3-1":"Марта|Мартин|Мартина|Мартиян","3-9":"Младен|Младена|Младенка","3-17":"Алекси|Алексей|Алекс|Алексия|Алексиана","3-19":"Матей|Матея","3-25":"Благой|Блага|Благовест|Благовеста|Благородна|Благомир|Благомира|Благослав|Благослава|Радостин|Радостина|Радост","3-26":"Гавраил|Гаврил|Габриел|Габриела","3-27":"Матрона","3-5":"Конон","3-22":"Василий","3-2":"Теодот","3-30":"Йоан","3-14":"Венедикт|Венета|Венетка|Веселин|Веселина|Веселка|Весела","3-6":"Тимотей|Тимо","4-1":"Мария|Мариан|Мариана|Мариела|Маринела|Маринка|Марика|Мара|Марийка|Мариета|Марио|Марин|Марина","4-4":"Исидор","4-5":"Теодул","4-6":"Методи|Методий","4-14":"Мартин|Мартина","4-25":"Марко|Марк","4-17":"Симеон|Симо|Симона","4-24":"Елисавета|Елиза","4-3":"Никита","4-10":"Терентий","4-30":"Яков|Якоб","4-7":"Теодосий|Тодосий|Доси","4-16":"Ирина|Ирена|Ира","5-1":"Тамара","5-2":"Борис|Борислав|Борислава|Борка|Герман|Германа","5-5":"Ирина|Ирена|Ира|Ирка","5-6":"Георги|Георгина|Георгия|Гергана|Герган|Гинка|Гинчо|Ганка|Ганчо|Гошо|Жоро|Гергин|Гергинка|Галина","5-11":"Кирил|Кирилка|Методи|Методий","5-15":"Зоя|Зоица","5-21":"Константин|Костадин|Костадинка|Косьо|Коста|Костка|Кънчо|Елена|Еленка|Елеонора|Ели|Елка","5-24":"Кирил|Кирилка|Методи|Методий","5-8":"Марк|Марко","5-9":"Никола|Николай","5-18":"Ирина|Ирена","5-3":"Тимотей|Тимо","5-10":"Симон|Симона","5-20":"Тодор|Тодорка","6-1":"Юстин|Юстина|Юстиниан","6-5":"Доротея|Дора|Доротей","6-11":"Варна|Варнава","6-15":"Вида|Видка|Видко|Видан|Видин","6-24":"Еньо|Енчо|Билян|Биляна|Огнян|Огняна","6-29":"Петър|Петра|Петка|Петко|Пенка|Пенчо|Пеньо|Петьо|Петя|Петрана|Камен|Каменка|Павел|Павлина|Павлинка|Паулина|Поли","6-30":"Апостол|Апостолка","6-2":"Никифор","6-20":"Методи","6-8":"Теодор|Теодора|Тодор|Тодорка","6-9":"Кирил|Кирилка","6-14":"Елисей","6-19":"Тадей","6-3":"Лукилиан","6-27":"Сампсон","7-1":"Козма|Дамян|Дамяна|Дамянка","7-7":"Неделя|Неделчо|Неда|Недялка|Недялко|Кирил|Кирилка","7-8":"Прокопи|Прокопий","7-17":"Марин|Марина|Маринела|Маринка|Маринчо","7-20":"Илия|Илиян|Илияна|Илко|Илка|Илиана|Елия|Гръм|Гръмка","7-25":"Анна|Ана|Анка|Анета|Аника|Аница|Анелия|Анелина|Анна-Мария","7-27":"Пантелей|Панталей","7-11":"Олга|Олгица","7-15":"Владимир|Владимира|Владко|Владислав|Владислава|Влади","7-22":"Магдалена|Магдалина|Магда|Лена|Леночка","7-14":"Козма|Дамян","7-5":"Атанас|Атанаска|Наско","8-1":"Макавей","8-6":"Преслав|Преслава|Спас|Спаска|Спасена|Спасиян","8-7":"Дончо|Донка|Доника","8-8":"Емил|Емилия|Емилиян|Емилиана","8-15":"Мария|Мариан|Мариана|Мариела|Маринела|Маринка|Марика|Мара|Марийка|Мариета|Марио|Богдана|Божана","8-20":"Самуил|Самуила","8-26":"Адриан|Адриана|Наталия|Натали|Наталка","8-27":"Фани|Фанка","8-28":"Йоан|Йоана","8-30":"Александър|Александра|Александрина|Сашо|Сашка|Алекс|Алексей|Алеко","8-2":"Илия|Илиян|Илияна","8-9":"Герман|Германа","8-24":"Евтихий","8-10":"Лаврентий|Лаврен","8-16":"Диомид","8-3":"Исак","8-18":"Флора|Флорентина|Лавър","9-1":"Симеон|Симеонка|Симона","9-5":"Захари|Захарий|Захарина|Елисавета","9-8":"Мария|Мариан|Мариана|Маргарита","9-14":"Кръстьо|Кръстю|Кръстинка|Кристиан|Кристиана|Кристина|Кристин|Кристиян|Кристияна|Христо|Христина|Христиана|Християн|Християна|Христомир|Христофор|Хриси","9-17":"Вяра|Надежда|Надя|Любов|Люба|Любка|Любомир|Любомира|Любен|Любена|Любослав|Любослава|София|Софка|Софи","9-22":"Тома|Томислав|Томислава","9-9":"Яким|Якимка","9-16":"Людмил|Людмила|Людмилка","9-24":"Текла|Теклица","9-11":"Теодора","9-19":"Трофим","9-2":"Мамант","9-30":"Григор|Григорий","9-6":"Михаил|Михаела","9-15":"Никита","9-28":"Харитон","10-1":"Закрила|Закрилка","10-14":"Петка|Петкана|Параскева|Параскев","10-19":"Тома|Томас","10-20":"Артемий","10-26":"Димитър|Димитрина|Димитринка|Митко|Митка|Димо|Димана|Димка|Димчо|Димитрия|Деметра|Деметрия","10-27":"Нестор|Нестора","10-2":"Киприан|Киприана","10-6":"Тома|Томас","10-8":"Пелагия","10-18":"Лука|Лукан|Лучезар|Лучезара","10-24":"Арета","10-10":"Евлампий","10-28":"Параскева|Параскев","10-12":"Дария|Дарина|Дарин|Даринка","10-15":"Евтим|Евтимия","10-31":"Лука","11-1":"Будин|Будинка","11-8":"Михаил|Михаела|Михо|Мишо|Миха|Михалина|Ангел|Ангела|Ангелина|Ангелинка|Архангел|Гавраил|Гаврил|Габриел|Габриела|Рафаел|Рафаела","11-11":"Мина|Минка|Минчо","11-15":"Гурий","11-16":"Матей|Матея","11-21":"Мария|Мариан|Мариана|Марийка|Мариела","11-22":"Филип|Филипа","11-23":"Александър|Александра|Сашо|Сашка|Алекс","11-25":"Климент|Климентина","11-30":"Андрей|Андрея|Андреан|Андреана|Андриан|Андрияна|Андро|Първан|Първанка","11-4":"Йоаникий","11-9":"Нектарий","11-13":"Златко|Златка|Златина|Злата|Златан|Златимир|Златимира","11-17":"Григор|Григорий|Гриша","11-6":"Павел|Павлина|Паулина|Поли","11-19":"Павел|Павлина","11-14":"Филип|Филипа|Филипина","11-24":"Екатерина|Катерина|Катя|Катюша|Катрин","11-26":"Стилиян|Стилияна|Стилян|Стиляна","12-4":"Варвара|Варварка","12-5":"Сава|Савка|Савчо","12-6":"Никола|Николай|Николина|Николинка|Нико|Ники|Никол|Николета|Николка|Никулица|Кольо|Колка","12-9":"Анна|Ана|Анка|Анета|Аника|Анелия","12-12":"Спиридон|Спиро|Спирка","12-17":"Данаил|Даниел|Даниела|Дана|Данка","12-20":"Игнат|Игнатка|Игнатий","12-21":"Юлиан|Юлиана|Юлия|Юлика|Юли","12-22":"Анастасия|Анастас|Настя|Наси","12-25":"Христо|Христина|Кристина|Кристиан|Кристиана|Христиан|Христиана|Христофор|Христомир|Рождена|Коледа|Божидар|Божидара","12-26":"Мария|Марийка|Маринела|Маринка|Богдана","12-27":"Стефан|Стефка|Стефания|Стефанка|Стефко|Стоян|Стоянка|Стойчо|Стойна","12-2":"Авакум","12-13":"Лукия|Лучия","12-15":"Елевтерий|Елефтерий","12-10":"Ангелина|Ангелинка","12-8":"Климент|Климентина","12-30":"Теодор|Теодора","12-1":"Филарет","12-3":"Софроний|Софрони","12-19":"Никола|Николай","12-31":"Силвестър|Силвия"};
var NED_MOVING_NAMES={"0":"Велика|Величка|Вела|Велислава|Велико|Велин|Велко|Вельо|Велимир|Велислав|Велина|Велка|Велимира|Паскал|Паска|Паскалина","39":"Спас|Спасен|Спасимир|Спасимира|Спасена|Спасия|Спаска","49":"Трайко|Траян|Траяна|Троянка","50":"Пламен|Пламена","-43":"Тодор|Тодорка|Тодорин|Тошо|Тотьо|Тото|Тода|Теодор|Теодора|Теди|Теодоси|Теодосий|Теодосия|Дора|Дорка|Дориана|Доротея|Доротей|Божидар|Божидара|Божана|Божан|Божил|Божко|Дарин|Дарина|Дарко|Дарка|Дария|Дариян|Дарислав|Дарислава","-8":"Лазар|Лазарка|Лазарина|Лазо|Лъчезар|Лъчезара","-7":"Цветан|Цветана|Цветанка|Цвете|Цветин|Цветина|Цветка|Цвятко|Цено|Цветелин|Цветелина|Цветомир|Цветомира|Цветомила|Цветослав|Цветослава|Цветимир|Виолета|Виола|Роза|Розалия|Розалина|Ружа|Маргарита|Маргарет|Невен|Невена|Невян|Невяна|Ненка|Росен|Росица|Росина|Камелия|Лилия|Лиляна|Лила|Лили|Ясен|Ясена|Ясмина|Жасмина|Явор|Яворка|Калина|Калинка|Здравко|Здравка|Детелина|Делян|Делянка|Деляна|Дилян|Диляна|Карамфил|Карамфила|Латинка|Латин|Теменужка|Дафина|Далия|Трендафил|Трендафила|Божура|Гроздена|Гроздан|Гроздана|Ива|Ивана|Малина|Ралица|Елица|Върбан|Върбинка|Върба|Магнолия|Иглика|Иглена|Зюмбюла|Люляна|Люлин|Люлина|Лоза|Лозана|Ренета|Китка|Орхидея|Аглика|Гергина|Гергинка"};
var namedayExpanded=false,namedayLastKey='';
function namedayForDate(d,daysSinceEaster){
 var key=(d.getMonth()+1)+'-'+d.getDate(),names=[],seen={};
 var sources=[NED_FIXED_NAMES[key],NED_MOVING_NAMES[String(daysSinceEaster)]];
 for(var si=0;si<sources.length;si++){
  if(!sources[si])continue;
  var items=sources[si].split('|');
  for(var i=0;i<items.length;i++){
   var n=items[i],lower=n.toLowerCase();
   if(n&&!seen[lower]){seen[lower]=true;names.push(n)}
  }
 }
 return names;
}
/* Astronomical Algorithms, Chapter 49, Jean Meeus.
   Corrected new/full Moon (JDE); TT->UTC offset near 2026 approximately 75s.
   We compare event's local calendar date (tablet timezone Europe/Sofia). */
function moonTrueJulian(k,full){
 var T=k/1236.85,T2=T*T,T3=T2*T,T4=T3*T,E=1-.002516*T-.0000074*T2,R=Math.PI/180,s=Math.sin;
 var M=(2.5534+29.10535670*k-.0000014*T2-.00000011*T3)*R;
 var P=(201.5643+385.81693528*k+.0107582*T2+.00001238*T3-.000000058*T4)*R;
 var F=(160.7108+390.67050284*k-.0016118*T2-.00000227*T3+.000000011*T4)*R;
 var O=(124.7746-1.56375588*k+.0020672*T2+.00000215*T3)*R;
 var J=2451550.09766+29.530588861*k+.00015437*T2-.000000150*T3+.00000000073*T4;
 J+=(full?-.40614:-.40720)*s(P)+(full?.17302:.17241)*E*s(M)
  +(full?.01614:.01608)*s(2*P)+(full?.01043:.01039)*s(2*F)
  +(full?.00734:.00739)*E*s(P-M)
  +(full?-.00515:-.00514)*E*s(P+M)
  +(full?.00209:.00208)*E*E*s(2*M)
  -.00111*s(P-2*F)-.00057*s(P+2*F)
  +.00056*E*s(2*P+M)-.00042*s(3*P)
  +.00042*E*s(M+2*F)+.00038*E*s(M-2*F)
  -.00024*E*s(2*P-M)-.00017*s(O)
  -.00007*s(P+2*M)+.00004*s(2*P-2*F)
  +.00004*s(3*M)+.00003*s(P+M-2*F)
  +.00003*s(2*P+2*F)-.00003*s(P+M+2*F)
  +.00003*s(P-M+2*F)-.00002*s(P-M-2*F)
  -.00002*s(3*P+M)+.00002*s(4*P);
 var a=[299.77+.107408*k-.009173*T2,251.88+.016321*k,251.83+26.651886*k,
  349.42+36.412478*k,84.66+18.206239*k,141.74+53.303771*k,
  207.14+2.453732*k,154.84+7.306860*k,34.52+27.261239*k,
  207.19+.121824*k,291.34+1.844379*k,161.72+24.198154*k,
  239.56+25.513099*k,331.55+3.592518*k];
 var w=[.000325,.000165,.000164,.000126,.000110,.000062,.000060,
 .000056,.000047,.000042,.000040,.000037,.000035,.000023];
 for(var i=0;i<a.length;i++)J+=w[i]*s(a[i]*R);
 return J;
}
function moonEventForDay(d){
 var k0=Math.round((d.getFullYear()+(d.getMonth()+.5)/12-2000)*12.3685);
 for(var i=k0-2;i<=k0+2;i++)for(var phase=0;phase<2;phase++){
  var k=i+(phase?.5:0);
  var jd=moonTrueJulian(k,phase===1);
  var e=new Date((jd-2440587.5)*86400000-75000);
  if(e.getFullYear()===d.getFullYear()&&e.getMonth()===d.getMonth()&&e.getDate()===d.getDate())
   return phase?'Пълнолуние':'Новолуние';
 }
 return '';
}

function clock(){var d=new Date(),h=d.getHours(),m=d.getMinutes();E('clock').textContent=(h<10?'0':'')+h+':'+(m<10?'0':'')+m;var days=['неделя','понеделник','вторник','сряда','четвъртък','петък','събота'],months=['януари','февруари','март','април','май','юни','юли','август','септември','октомври','ноември','декември'];E('date').innerHTML=days[d.getDay()]+'<span style="display:block">'+d.getDate()+' '+months[d.getMonth()]+'</span>';updateCalendar(d)}clock();setInterval(clock,15000);
function updateCalendar(d){
 var m=d.getMonth()+1,day=d.getDate(),key=m+'-'+day;
 var holidays={'1-1':'Нова година','1-6':'Йордановден','1-7':'Ивановден','2-14':'Трифон Зарезан','3-1':'Баба Марта','3-3':'Национален празник','3-8':'Ден на жената','5-1':'Ден на труда','5-6':'Гергьовден','5-24':'24 май','6-1':'Ден на детето','9-6':'Съединението','9-22':'Независимостта','11-1':'Ден на будителите','12-6':'Никулден','12-24':'Бъдни вечер','12-25':'Коледа','12-26':'Коледа','12-31':'Нова година утре'};
 // Orthodox Easter: Gregorian computus (Bulgarian Orthodox Church uses Julian paschalion).
 function easter(y){var a=y%4,b=y%7,c=y%19,dd=(19*c+15)%30,e=(2*a+4*b-dd+34)%7;return new Date(y,2,22+dd+e+13)}
 var eas=easter(d.getFullYear()),today=new Date(d.getFullYear(),d.getMonth(),day);
 var delta=Math.round((today-eas)/86400000);
 var moving={};moving[-2]='Разпети петък';moving[0]='Великден';moving[1]='Светли понеделник';moving[-7]='Цветница';moving[49]='Петдесетница';
 E('holiday').textContent=holidays[key]||moving[delta]||'';
 var names=namedayForDate(d,delta),nameLabel=E('nameday');
 if(namedayLastKey!==key){namedayLastKey=key;namedayExpanded=false}
 if(names.length){
  var subset=namedayExpanded?names:names.slice(0,7),remain=names.length-subset.length;
  nameLabel.classList.remove('hide');
  nameLabel.textContent='Имен ден: '+subset.join(', ')+(remain?' · още '+remain:'')+(namedayExpanded?' ▲':'');
  nameLabel.title='Именници: '+names.join(', ')+(remain?' · натисни за всички':'');
  nameLabel.onclick=function(){namedayExpanded=!namedayExpanded;updateCalendar(new Date())};
 }else{nameLabel.textContent='';nameLabel.classList.add('hide');nameLabel.onclick=null}
 E('moon-phase-label').textContent=moonEventForDay(d);
 var moon=moonInfo(d),illumination=Math.round(moon.illumination*100);
 E('moon').innerHTML=moonSvg(moon);
 E('moon').setAttribute('aria-label',(moon.waxing?'Растяща':'Намаляваща')+' Луна · '+illumination+'% осветена');
 E('moon').title=(moon.waxing?'Растяща':'Намаляваща')+' Луна · '+illumination+'% осветена';
}
/* Low-precision solar/lunar ecliptic longitudes; actual date/time, not fixed lunar age. */
function moonInfo(date){
 var rad=Math.PI/180, days=date.getTime()/86400000+2440587.5-2451545;
 var sunM=(357.5291+0.98560028*days)*rad;
 var sunLon=sunM+(1.9148*Math.sin(sunM)+0.0200*Math.sin(2*sunM)+0.0003*Math.sin(3*sunM))*rad+102.9372*rad+Math.PI;
 var moonM=(134.963+13.064993*days)*rad;
 var moonLon=(218.316+13.176396*days+6.289*Math.sin(moonM))*rad;
 var elongation=((moonLon-sunLon)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
 return {illumination:(1-Math.cos(elongation))/2,waxing:elongation<Math.PI};
}
function moonSvg(moon){
 var r=42, rx=Math.max(.05,Math.abs(1-2*moon.illumination)*r);
 var outerSweep=moon.waxing?1:0, terminatorSweep=moon.waxing?(moon.illumination<=.5?0:1):(moon.illumination<=.5?1:0);
 var lit='M50 8 A42 42 0 0 '+outerSweep+' 50 92 A'+rx.toFixed(2)+' 42 0 0 '+terminatorSweep+' 50 8 Z';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="presentation" aria-hidden="true" data-waxing="'+(moon.waxing?'1':'0')+'" data-illumination="'+(moon.illumination*100).toFixed(1)+'">'
  +'<defs><linearGradient id="nedMoonLight" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f9fafb"/><stop offset="1" stop-color="#c8d7e7"/></linearGradient><clipPath id="nedMoonClip"><path d="'+lit+'"/></clipPath></defs>'
  +'<circle cx="50" cy="50" r="42" fill="#111b29" stroke="#8194aa" stroke-width="1.1"/>'
  +'<path d="'+lit+'" fill="url(#nedMoonLight)"/>'
  +'<g clip-path="url(#nedMoonClip)" fill="#899bab" opacity=".32"><circle cx="71" cy="32" r="6"/><circle cx="78" cy="65" r="8"/><circle cx="60" cy="52" r="5"/><circle cx="35" cy="38" r="9"/><circle cx="34" cy="70" r="5"/></g>'
  +'<circle cx="50" cy="50" r="42" fill="none" stroke="#dce8f5" stroke-opacity=".45" stroke-width="1.3"/></svg>';
}

function req(path,done){var x=new XMLHttpRequest();x.open('GET',path,true);x.timeout=18000;x.onreadystatechange=function(){if(x.readyState===4){var data=null;try{data=JSON.parse(x.responseText)}catch(e){}done(x.status,data)}};x.ontimeout=function(){done(0,null)};x.send()}
function loc(x){return /царево|tsarevo|tzarevo/i.test(x.name+' '+x.id)?'Царево':'София'}
function kind(x){var k=(x.kind||'').toLowerCase(),n=x.name||'';if(k==='temperature'||x.unit==='°C'||/temperature|температура/i.test(n))return 'temperature';if(k==='humidity'||(/влажност|humidity/i.test(n)))return 'humidity';if(k==='battery'||/battery|батерия/i.test(n))return 'battery';return 'other'}
function name(x){return (x.name||x.id||'Сензор').replace(/\s*(temperature|humidity|battery|температура|влажност|батерия)\s*$/i,'').replace(/^(дружба|софия|царево|druzhba|sofia|tsarevo|tzarevo)[\s:_-]*/i,'').replace(/[\s:_-]*(царево|tsarevo|tzarevo)\s*$/i,'').replace(/\s+/g,' ').trim()||'Сензор'}
function ok(x){return x&&x.state!=null&&x.state!=='unknown'&&x.state!=='unavailable'&&x.state!==''}
function age(x){if(!x||!x.updated)return '—';var n=Date.parse(x.updated);if(!isFinite(n))return '—';var min=Math.max(0,Math.floor(((new Date()).getTime()-n)/60000));return min<60?min+' мин':min<1440?Math.floor(min/60)+' ч':Math.floor(min/1440)+' д'}
function stale(r){var a=[r.temperature,r.humidity].filter(Boolean);return a.length===0||a.every(function(x){return !ok(x)})}
function build(){
var defs=[
['Хола','София',/^Дружба\s+хола\s+1\s+(Temperature|Humidity|Battery)$/i],
['Детска','София',/^Дружба\s+детска\s+2\s+(Temperature|Humidity|Battery)$/i],
['Спалня','София',/^Дружба\s+спалня\s+3\s+(Temperature|Humidity|Battery)$/i],
['Външна','София',/^Дружба\s+външна\s+5\s+(Temperature|Humidity|Battery)$/i],
['Гараж','София',/^Дружба\s+гаража\s+6\s+(Temperature|Humidity|Battery)$/i],
['Хола','Царево',/^хола\s+Царево\s+(Temperature|Humidity|Battery)$/i]
];
rooms=defs.map(function(d){var r={name:d[0],location:d[1],temperature:null,humidity:null,battery:null};entities.forEach(function(x){var n=(x.name||'').replace(/\s+/g,' ').trim();if(d[2].test(n)){var k=kind(x);if(k==='temperature'||k==='humidity'||k==='battery')r[k]=x}});return r})
}
function val(x,k){return ok(x)?esc(x.state)+(k==='temperature'?'°C':'%'):'—'}
function row(r,i,small){var isStale=stale(r),a=r.temperature||r.humidity||r.other,bat=r.battery;if(r.other)return '<button class="sensor" data-room="'+i+'"><span class="name">'+esc(r.name)+'</span><span class="value">'+esc(r.other.state)+' '+esc(r.other.unit||'')+'</span></button>';return '<button class="sensor'+(isStale?' stale':'')+'" data-room="'+i+'"><span class="name">'+esc(r.name)+(isStale?'<div class="warn">Недостъпен / без данни</div>':'')+'</span><span class="value temp">'+val(r.temperature,'temperature')+'</span><span class="value hum">'+val(r.humidity,'humidity')+'</span><span class="battery">▰ '+val(bat,'battery')+'</span><span class="age">'+(a?age(a):'—')+'</span></button>'}
function render(){build();
var fixed={};rooms.forEach(function(r){['temperature','humidity','battery'].forEach(function(k){if(r[k])fixed[r[k].id]=r})});
var groups={sofia:[],tsarevo:[],other:[]};
rooms.forEach(function(r){var active=false,place=r.location==='София'?'sofia':'tsarevo';['temperature','humidity','battery'].forEach(function(k){if(r[k]){var p=pref(r[k].id);if(sensorPrefs.hasOwnProperty(r[k].id)){if(p.show){active=true;place=p.place||place}}else if(r.location==='София'){active=true}}});if(active)groups[place]&&groups[place].push(r)});
entities.forEach(function(x){if(fixed[x.id])return;var p=pref(x.id);if(!p.show)return;var place=p.place||'other';if(!groups[place])place='other';var r={name:x.name||x.id,location:place==='sofia'?'София':place==='tsarevo'?'Царево':'Други',temperature:null,humidity:null,battery:null,other:null};var k=kind(x);if(k==='temperature'||k==='humidity'||k==='battery')r[k]=x;else r.other=x;groups[place].push(r);rooms.push(r)});
['sofia','tsarevo','other'].forEach(function(g){var list=groups[g],html=list.map(function(r){return row(r,rooms.indexOf(r),false)}).join('');E(g).innerHTML=html||'<div class="empty">Няма избрани сензори</div>';E(g+'-section').style.display=list.length?'':'none'});
Array.prototype.forEach.call(document.querySelectorAll('[data-room]'),function(b){b.onclick=function(){openRoom(rooms[Number(this.getAttribute('data-room'))])}})}
function settings(){var rows=entities.map(function(x){var p=pref(x.id),checked=p.show?' checked':'',place=p.place||'other';return '<div class="setting-item"><div class="setting-title">'+esc(x.name||x.id)+'</div><div class="setting-id">'+esc(x.id)+'</div><label><input type="checkbox" data-sensor-toggle="'+esc(x.id)+'"'+checked+'> Покажи</label><select data-sensor-place="'+esc(x.id)+'"><option value="sofia"'+(place==='sofia'?' selected':'')+'>София</option><option value="tsarevo"'+(place==='tsarevo'?' selected':'')+'>Царево</option><option value="other"'+(place==='other'?' selected':'')+'>Други</option></select></div>'}).join('');
E('settings-list').innerHTML=rows||'<div class="empty">Няма заредени сензори</div>';
Array.prototype.forEach.call(document.querySelectorAll('[data-sensor-toggle]'),function(el){el.onchange=function(){var id=this.getAttribute('data-sensor-toggle'),p=pref(id);sensorPrefs[id]={show:this.checked,place:p.place||'other'};savePrefs();render()}});
Array.prototype.forEach.call(document.querySelectorAll('[data-sensor-place]'),function(el){el.onchange=function(){var id=this.getAttribute('data-sensor-place'),p=pref(id);sensorPrefs[id]={show:p.show,place:this.value};savePrefs();render()}});
}

function renderHeat(climates){
var x=null;for(var ci=0;ci<climates.length;ci++){if(/спалня/i.test(climates[ci].name||'')){x=climates[ci];break}}x=x||climates[0];
var a=x&&x.attributes||{},current=a.current_temperature,target=a.temperature;
var battery=null;for(var bi=0;bi<entities.length;bi++){if(entities[bi].id==='sensor.druzhba_spalnia_battery'){battery=entities[bi];break}}
E('heating').innerHTML='<div class="sensor heatrow"><strong>Регулатор парно · Спалня</strong><span class="temp">'+esc(current==null?'—':current+'°C')+'</span><span class="muted">Зададени '+esc(target==null?'—':target+'°C')+'</span><span class="battery">▰ '+val(battery,'battery')+'</span></div>'
}
function weatherSvg(code){
code=Number(code);
var sun='<circle cx="19" cy="19" r="8" fill="#ffcf52"/><g stroke="#ffcf52" stroke-width="3" stroke-linecap="round"><path d="M19 3v6M19 29v6M3 19h6M29 19h6M8 8l4 4M26 26l4 4M30 8l-4 4M12 26l-4 4"/></g>';
var cloud='<path d="M13 34h25c7 0 11-5 11-11s-5-11-11-11c-2 0-4 0-5 1C29 5 17 5 12 14 4 14 1 20 1 25c0 5 5 9 12 9Z" fill="#d4e1ed" stroke="#8299af" stroke-width="2"/>';
var rain='<g stroke="#58bbff" stroke-width="3" stroke-linecap="round"><path d="M15 39l-4 8M29 39l-4 8M42 39l-4 8"/></g>';
var snow='<g fill="#a5e3ff" font-size="19"><text x="12" y="49">*</text><text x="33" y="49">*</text></g>';
var thunder='<path d="M27 34l-8 13h9l-4 10 16-20H29l5-3" fill="#ffdb58"/>';
var body=code===0?sun:code<=2?'<g transform="translate(0 -3)">'+sun+'</g><g transform="translate(12 10) scale(.75)">'+cloud+'</g>':code===3||code===45||code===48?cloud:code>=95?cloud+rain+thunder:code>=71&&code<=77?cloud+snow:cloud+rain;
return '<svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+body+'</svg>';
}
function weather(d){
var w=d&&d.weather;
if(!w){E('weather-desc').textContent='Прогнозата за София не е достъпна';E('forecast').innerHTML='<div class="muted">Няма метеоданни</div>';return}
var icons={0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'❄️',75:'❄️',80:'🌦️',81:'🌧️',82:'🌧️',95:'⛈️',96:'⛈️',99:'⛈️'};
function description(code){if(code===0)return 'Слънчево';if(code<=2)return 'Разкъсана облачност';if(code===3)return 'Облачно';if(code===45||code===48)return 'Мъгла';if(code>=51&&code<=55)return 'Ръмеж';if(code>=61&&code<=65)return 'Дъжд';if(code>=71&&code<=77)return 'Сняг';if(code>=80&&code<=82)return 'Превалявания';if(code>=95)return 'Гръмотевици';return 'Променливо'}
E('weather-icon').innerHTML=weatherSvg(w.code);
E('weather-temp').textContent=w.temperature==null?'—':Math.round(w.temperature)+'°C';
E('weather-desc').textContent='София · '+description(Number(w.code));
E('forecast').innerHTML=(w.forecast||[]).slice(0,3).map(function(f){var dt=new Date(f.date+'T12:00:00');return '<div class="day"><div class="forecast-weekday">'+esc(['нд','пн','вт','ср','чт','пт','сб'][dt.getDay()])+'</div><div class="forecast-icon">'+weatherSvg(f.code)+'</div><div class="forecast-desc">'+esc(description(Number(f.code)))+'</div><strong>'+esc(Math.round(f.low))+'° / '+esc(Math.round(f.high))+'°</strong><div class="rain">💧 '+(f.rain==null?'—':esc(Math.round(f.rain))+'%')+'</div></div>'}).join('')||'<div class="muted">Няма прогноза</div>'
}

/* v2.17: read the tablet's own battery, not the batteries of room sensors.
   On HTTP, Chromium may block Battery Status API; in that case display —%
   unless HA reports exactly one identifiable tablet battery sensor. */
var tabletBatteryNative=null, tabletBatteryObject=null;
function tabletBatteryShow(level,charging,source){
  var label=E('tablet-battery');if(!label)return;
  if(level===null||level===''||!isFinite(Number(level))||Number(level)<0||Number(level)>100)return;
  var pct=Math.round(Number(level));
  label.textContent='🔋 '+pct+'%'+(charging===true?' ⚡':'');
  label.classList.toggle('charging',charging===true);
  label.classList.toggle('low',pct<=20&&charging!==true);
  label.title='Батерия на таблета: '+pct+'%'+
     (charging===true?' · Захранването е включено':charging===false?' · Без външно захранване':'')+
     (source?' · '+source:'');
}
function tabletBatteryFromHA(){
  if(tabletBatteryNative)return;
  var selected='';try{selected=localStorage.getItem('ned-home-tablet-battery-entity')||''}catch(e){}
  var matches=[];
  for(var i=0;i<entities.length;i++){
    var item=entities[i];if(!item||!item.id)continue;
    var full=(item.name||'')+' '+item.id;
    var percent=item.unit==='%'||/_battery_level$/i.test(item.id);
    var battery=/battery|батерия/i.test(full);
    var tablet=/tablet|таблет|galaxy[\s_-]*tab|samsung[\s_-]*tab|sm[\s_-]*t\d/i.test(full);
    if(selected?item.id===selected:(percent&&battery&&tablet))matches.push(item);
  }
  if(matches.length!==1)return;
  var x=matches[0];if(x.state==='unknown'||x.state==='unavailable'||x.state===null||x.state==='')return;
  tabletBatteryShow(x.state,null,'Home Assistant');
}
function tabletBatteryInit(){
  /* Native Fully Kiosk JS interface, when available. */
  try{
    if(typeof window!=='undefined'&&window.fully&&typeof window.fully.getBatteryLevel==='function'){
      tabletBatteryNative=true;
      var readFully=function(){
        try{tabletBatteryShow(window.fully.getBatteryLevel(),
          typeof window.fully.isPlugged==='function'?!!window.fully.isPlugged():null,'Таблет')}
        catch(e){}
      };
      readFully();setInterval(readFully,60000);return;
    }
  }catch(e){}
  /* Legacy Android browsers exposing BatteryManager directly. */
  try{
    var legacy=navigator.battery||navigator.webkitBattery||navigator.mozBattery;
    if(legacy){tabletBatteryObject=legacy;tabletBatteryNative=true;tabletBatterySubscribe(legacy);return}
  }catch(e){}
  /* Recent Chrome: normally HTTPS-only. */
  try{
    if(typeof navigator.getBattery==='function'){
      navigator.getBattery().then(function(battery){
        if(!battery||typeof battery.level!=='number')return;
        tabletBatteryObject=battery;tabletBatteryNative=true;tabletBatterySubscribe(battery);
      },function(){tabletBatteryFromHA()});
    }
  }catch(e){}
}
function tabletBatterySubscribe(battery){
  function update(){tabletBatteryShow(battery.level*100,battery.charging,'Браузър')}
  update();
  if(typeof battery.addEventListener==='function'){
    battery.addEventListener('levelchange',update);
    battery.addEventListener('chargingchange',update);
  }
  setInterval(update,60000);
}

function load(){req('/api/status',function(status,data){if(status===401){E('auth').classList.remove('hide');E('status').textContent='Необходима е парола';return}if(status!==200||!data){E('status').textContent='Няма връзка';return}if(data.error){E('message').textContent=data.error;E('status').textContent='Грешка';return}E('auth').classList.add('hide');E('message').textContent='';entities=data.entities||[];tabletBatteryFromHA();climateItems=(data.climates||[]).map(function(c){return {id:c.id,name:c.name,state:c.state,unit:'',kind:'climate'}});render();if(!E('settings-overlay').classList.contains('hide'))settings();E('status').textContent='● Онлайн · '+rooms.filter(function(r){return r.temperature||r.humidity}).length+' помещения';renderHeat(data.climates||[]);weather(data)})}
function openRoom(r){selected=r;period=24;E('dialog-title').textContent=r.name+' · '+r.location;E('details').innerHTML='<div class="stats"><div>Температура <span class="temp">'+val(r.temperature,'temperature')+'</span></div><div>Влажност <span class="hum">'+val(r.humidity,'humidity')+'</span></div><div>Батерия <span>'+val(r.battery,'battery')+'</span></div></div><div class="muted">Последно обновяване: '+age(r.temperature||r.humidity)+' (промяна в Home Assistant, не непременно физически отчет)</div>';E('overlay').classList.remove('hide');setPeriod(24)}
function setPeriod(p){period=p;Array.prototype.forEach.call(document.querySelectorAll('[data-period]'),function(b){b.classList.toggle('selected',Number(b.getAttribute('data-period'))===p)});if(!selected)return;var ids=[selected.temperature,selected.humidity].filter(Boolean).map(function(x){return encodeURIComponent(x.id)});if(!ids.length){drawHistory({});return}req('/api/history?hours='+p+'&entities='+ids.join(','),function(status,data){drawHistory(status===200&&data?data:{})})}
function drawHistory(data){['temperature','humidity'].forEach(function(k){var x=selected&&selected[k],samples=x&&data[x.id]||[];var points=samples.map(function(v){return {t:Date.parse(v.t),v:Number(v.v)}}).filter(function(v){return isFinite(v.t)&&isFinite(v.v)});var target=E(k==='temperature'?'chart-temp':'chart-hum');if(points.length<2){target.innerHTML='<div class="empty">Няма налична история за периода</div>';return}var min=Math.min.apply(null,points.map(function(v){return v.v})),max=Math.max.apply(null,points.map(function(v){return v.v})),lo=Math.min.apply(null,points.map(function(v){return v.t})),hi=Math.max.apply(null,points.map(function(v){return v.t})),span=Math.max(1,max-min),dur=Math.max(1,hi-lo);var poly=points.map(function(v){return (20+(v.t-lo)/dur*560).toFixed(1)+','+(130-(v.v-min)/span*105).toFixed(1)}).join(' ');target.innerHTML='<svg viewBox="0 0 600 150" role="img" aria-label="История"><line x1="20" y1="130" x2="580" y2="130" stroke="#555"/><polyline fill="none" stroke="'+(k==='temperature'?'#ffbe78':'#8ac8ff')+'" stroke-width="2.5" points="'+poly+'"/></svg><div class="muted">Мин '+min.toFixed(1)+' · Макс '+max.toFixed(1)+'</div>'})}
E('settings-btn').onclick=function(){settings();E('settings-overlay').classList.remove('hide')};E('settings-close').onclick=function(){E('settings-overlay').classList.add('hide')};E('settings-overlay').onclick=function(e){if(e.target===this)this.classList.add('hide')};E('refresh').onclick=load;E('login').onclick=function(){var x=new XMLHttpRequest();x.open('POST','/api/login',true);x.setRequestHeader('Content-Type','application/json');x.onload=function(){if(x.status===200){E('password').value='';load()}else{E('status').textContent='Грешна парола'}};x.send(JSON.stringify({password:E('password').value}))};E('password').onkeydown=function(e){if(e.key==='Enter')E('login').click()};E('close').onclick=function(){E('overlay').classList.add('hide')};E('overlay').onclick=function(e){if(e.target===E('overlay'))E('overlay').classList.add('hide')};document.addEventListener('keydown',function(e){if(e.key==='Escape')E('overlay').classList.add('hide')});Array.prototype.forEach.call(document.querySelectorAll('[data-period]'),function(b){b.onclick=function(){setPeriod(Number(this.getAttribute('data-period')))}});tabletBatteryInit();load();setInterval(load,30000);
if('serviceWorker' in navigator){try{navigator.serviceWorker.register('/sw.js')}catch(e){}}
})();