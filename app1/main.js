// (setq js-indent-level 1)  # for Emacs

function makelink(indexobj,txt) {
 let href = window.location.href;
 let html = '' // default
 if (indexobj == null) {
  return html;
 }
 //let url = new URL(href);
 //let search = url.search  // a string, possibly empty
 let base = href.replace(/[?].*$/,'');
 let b = indexobj.b;
 let c = indexobj.c;
 let s = indexobj.s;
 let v2 = indexobj.v2;
 let newsearch = `?${b},${c},${s},${v2}`;
 let newhref = base + newsearch;
 html = `<a class="nppage" href="${newhref}"><span class="nppage">${txt}</span></a>`;
 return html;
}
function display_ipage_id(indexes) {
 //console.log('display_ipage_id: indexes=',indexes);
 [indexprev,indexcur,indexnext] = indexes;
 let prevlink = makelink(indexprev,'<');
 if (prevlink == null) {
  prevlink = ''
 }
 let nextlink = makelink(indexnext,'>');
 if (nextlink == null) {
  nextlink = ''
 }

 let ipage = indexcur['ipage']; // an int

 let html = `<p>${prevlink} <span class="nppage">Page ${ipage}</span> ${nextlink}</p>`;
 let elt = document.getElementById('ipageid');
 elt.innerHTML = html;
}

function get_pdfurl_from_index(indexobj) {
/* indexobj assumed an element of indexdata
 return name of file with the given page
 shat-NNNN.pdf  example vp = "0123" 
*/
 let vp = indexobj['vp'];
 let pdf = `pdfpages/amar1-${vp}.pdf`;
 return pdf;
}

function get_ipage_html(indexcur) {
 let html = null;
 if (indexcur == null) {return html;}
 let pdfurl = get_pdfurl_from_index(indexcur);
 if (pdfurl == null) {
  return html;
 }
 let base = '..';
 let urlcur = `${base}/${pdfurl}`;
 //let urlcur = `../pdfpages/${pdfcur}`;
 let android = ` <a href='${urlcur}' style='position:relative; left:100px;'>Click to load pdf</a>`;
 let imageElt = `<object id='servepdf' type='application/pdf' data='${urlcur}' 
              style='width: 98%; height:98%'> ${android} </object>`;
 //console.log('get_ipage_html. imageElt=',imageElt);
 return imageElt;
}

function display_ipage_html(indexes) {
 let defaultval,elt, html;
 defaultval = null;
 elt=document.getElementById('ipage');
 if (indexes == defaultval) {
  html = '<b>Page not found</b>';
 } else {
  display_ipage_id(indexes);
  html = get_ipage_html(indexes[1]);
  if (html == null) {
   html = '';
  }
 }
  elt.innerHTML = html;
}

function get_prevobj(curobj,icur,indexdata) {
 let vp = curobj.vp;
 let ans = null;  //default
 let obj;
 let maxidx = indexdata.length - 1;
 let idx = icur;
 while ((0 <= idx) && (idx <= maxidx)) {
  obj = indexdata[idx];
  if (obj.vp != curobj.vp) {
   ans = obj;
   break;
  } else {
   idx = idx - 1;
  }
 }
 return ans;
}

function get_nextobj(curobj,icur,indexdata) {
 let vp = curobj.vp;
 let ans = null;  //default
 let obj;
 let maxidx = indexdata.length - 1;
 let idx = icur;
 while ((0 <= idx) && (idx <= maxidx)) {
  obj = indexdata[idx];
  if (obj.vp != curobj.vp) {
   ans = obj;
   break;
  } else {
   idx = idx + 1;
  }
 }
 return ans;
}

function get_indexobjs_from_verse(verse) {
 // uses indexdata from index.js
 // verse is a tuple of ints OR NULL
 let defaultval = null;
 if (verse == defaultval) {
  return defaultval;
 }
 let icur = -1;
 let nparm = verse.length;  // 3 or 4
 for (let i=0; i < indexdata.length; i++ ) {
  let obj = indexdata[i];
  if (obj.b != verse[0]) {continue;}
  if (obj.c != verse[1]) {continue;}
  if (nparm == 4) {
   if (obj.s != verse[2]) {continue;}
   if ((obj.v1 <= verse[3]) && (verse[3] <= obj.v2)) {
    icur = i;
    break;
   }
  }else {
   if ((obj.v1 <= verse[2]) && (verse[2] <= obj.v2)) {
    icur = i;
    break;
   }
  }
 }
 let ans, prevobj, curobj, nextobj
 if (icur == -1) {
  ans = defaultval;
 } else {
  curobj = indexdata[icur];
  // get previous object with a different pdfpage, or null
  let prevobj = get_prevobj(curobj,icur,indexdata);
  // get next object with a different pdfpage, or null
  let nextobj = get_nextobj(curobj,icur,indexdata);
  ans = [prevobj,curobj,nextobj];
 } 
 return ans;
}

function get_verse_from_url() {
 /* return 4-tuple or 3-tuple of int numbers derived from url search string.
    OR returns null
*/
 let href = window.location.href;
 let url = new URL(href);
 // url = http://xyz.com?X ,
 // search = ?X
 let search = url.search;  // a string, possibly empty
 let defaultval = null; // [0,0,0,0]; // default value (title verse)
 let nparm = 4;
 let x = search.match(/^[?]([0-9]+),([0-9]+),([0-9]+),([0-9]+)$/);
 if (x == null) {
  // try 3 parameters (chapter, book, verse -- no section)
  x = search.match(/^[?]([0-9]+),([0-9]+),([0-9]+)$/);
  if (x != null) {
   nparm = 3;
  }
 }
 if (x == null) {
  return defaultval;
 }
 // convert to ints
 iverse = [];
 for(let i=0;i<nparm;i++) {
  iverse.push(parseInt(x[i+1]));
 }
 return iverse;
}

function display_ipage_url() {
 let url_verse = get_verse_from_url();
 //console.log('url_verse=',url_verse);
 let defaultval = null;
 let indexobjs;
 if (url_verse == defaultval) {
  indexobjs = defaultval;
 }else {
  indexobjs = get_indexobjs_from_verse(url_verse);
 }
 //console.log('indexobjs=',indexobjs);
 display_ipage_html(indexobjs);
}

document.getElementsByTagName("BODY")[0].onload = display_ipage_url;

