document.addEventListener('DOMContentLoaded', function() {
  const authn = UI.authn
  const authSession = UI.authn.authSession
  const store = UI.store
  const $rdf = UI.rdf
  const dom = document
  $rdf.Fetcher.crossSiteProxyTemplate = self.origin + '/xss?uri={uri}'
  const uri = new URLSearchParams(window.location.search).get('uri');
  window.document.title = 'SolidOS Web App: ' + uri
  const outliner = panes.getOutliner(dom) // function from solid-panes

  function go () {
    const subject = $rdf.sym(uriField.value || uri);
    outliner.GotoSubject(subject, true, undefined, true, undefined);
    mungeLoginArea();
  }

  const uriField = dom.getElementById('uriField')
  const goButton = dom.getElementById('goButton')
  const loginButtonArea = document.getElementById("loginButtonArea");
  const webIdArea = dom.getElementById('webId')
  const banner = dom.getElementById('inputArea')

  uriField.value = uri || '';
  goButton.addEventListener('click', go, false);

  uriField.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      go(e)
    }
  }, false)

  async function mungeLoginArea(){
    loginButtonArea.innerHTML="";
    if(uriField.value) {
      loginButtonArea.appendChild(UI.login.loginStatusBox(document, null, {}))
    }
    const me = authn.currentUser()
    if (me) {       
      const logoutButton = loginButtonArea.querySelector('input');         
      logoutButton.value = "Logout";           
      let displayId = `&lt;${me.value}>`;
      webIdArea.innerHTML = displayId;                                     
      banner.style.backgroundColor="#bbccbb";                              
    } else {                                                                  
      banner.style.backgroundColor="#ccbbbb";                              
    }                                                                       
    loginButtonArea.style.display="inline-block";                           
  }      

  if (authSession) {
    authSession.onLogin(() => {
      mungeLoginArea();
      go()
    })
    authSession.onLogout(() => {
      mungeLoginArea();
      webIdArea.innerHTML = "public user";
      go()
    })
    authSession.onSessionRestore((url) => {
      mungeLoginArea();
      go()
    })
  }    
  mungeLoginArea();
  if (uri) go();
});

