/** Brazilian retail dates. UTC keeps date-only calculations independent of server timezone. */
export interface OfferDate { date: string; name: string; idea: string; category: "holiday" | "commercial" | "season" }
const fixed: Array<[number, number, string, string, OfferDate["category"]]> = [
 [1,1,"Ano Novo","Organização, metas e bem-estar", "holiday"],
 [2,14,"Volta às aulas","Papelaria, estudos e tecnologia", "season"],
 [3,8,"Dia da Mulher","Presentes, autocuidado e moda", "commercial"],
 [3,15,"Dia do Consumidor","Ofertas, cupons e comparativos", "commercial"],
 [4,21,"Tiradentes","Viagens e lazer", "holiday"],
 [5,1,"Dia do Trabalho","Ferramentas, carreira e produtividade", "holiday"],
 [6,12,"Dia dos Namorados","Presentes, experiências e beleza", "commercial"],
 [6,24,"São João","Receitas, decoração e roupas típicas", "season"],
 [9,7,"Independência do Brasil","Produtos nacionais e viagens", "holiday"],
 [9,15,"Dia do Cliente","Ofertas e relacionamento com clientes", "commercial"],
 [10,12,"Dia das Crianças","Brinquedos, livros e atividades", "holiday"],
 [10,15,"Dia dos Professores","Presentes e materiais de ensino", "commercial"],
 [11,2,"Finados","Flores e homenagens", "holiday"],
 [11,15,"Proclamação da República","Viagens e lazer", "holiday"],
 [11,20,"Consciência Negra","Cultura, livros e negócios de criadores negros", "holiday"],
 [12,25,"Natal","Presentes, decoração e ceia", "holiday"],
 [12,31,"Ano-Novo","Festas, viagens e organização", "season"],
];
function iso(d: Date) { return d.toISOString().slice(0,10); }
function easter(year: number): Date {
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;
 return new Date(Date.UTC(year,Math.floor(n/31)-1,(n%31)+1));
}
function offset(date: Date, days: number) { return new Date(date.getTime()+days*86400000); }
function nthSunday(year: number, month: number, n: number) { const first=new Date(Date.UTC(year,month-1,1)).getUTCDay(); return new Date(Date.UTC(year,month-1,1+(7-first)%7+7*(n-1))); }
export function offerDates(year: number): OfferDate[] {
 const easterDay=easter(year); const thanksgiving=new Date(Date.UTC(year,10,1+(4-new Date(Date.UTC(year,10,1)).getUTCDay()+7)%7+21));
 const moving: Array<[Date,string,string,OfferDate["category"]]> = [
  [offset(easterDay,-47),"Carnaval","Fantasias, maquiagem e viagens","season"],
  [offset(easterDay,-2),"Sexta-feira Santa","Receitas e produtos para a data","holiday"],
  [easterDay,"Páscoa","Chocolates, receitas e presentes","commercial"],
  [offset(easterDay,60),"Corpus Christi","Viagens e lazer","season"],
  [nthSunday(year,5,2),"Dia das Mães","Presentes, beleza e experiências","commercial"],
  [nthSunday(year,8,2),"Dia dos Pais","Presentes, tecnologia e experiências","commercial"],
  [offset(thanksgiving,1),"Black Friday","Promoções, comparativos e listas de ofertas","commercial"],
  [offset(thanksgiving,4),"Cyber Monday","Tecnologia e ofertas digitais","commercial"],
 ];
 return [...fixed.map(([month,day,name,idea,category])=>({date:iso(new Date(Date.UTC(year,month-1,day))),name,idea,category})),...moving.map(([date,name,idea,category])=>({date:iso(date),name,idea,category}))].sort((a,b)=>a.date.localeCompare(b.date));
}
