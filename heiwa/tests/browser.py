import functools,http.server,threading,json,pathlib
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).parents[1]
handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(root))
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':412,'height':915},device_scale_factor=1)
  errors=[];requests=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
  def groq(route):
   requests.append(route.request)
   route.fulfill(json={'choices':[{'message':{'content':'Risposta di prova HEIWA <script>window.bad=1</script>'}}]},headers={'Access-Control-Allow-Origin':'*'})
  page.route('https://api.groq.com/openai/v1/chat/completions',groq)
  page.goto(f'http://127.0.0.1:{server.server_port}/')
  page.evaluate("localStorage.setItem('dan_api_key','originale-da-non-leggere');localStorage.setItem('dan_history',JSON.stringify([{role:'user',content:'chat privata originale'}]))")
  page.reload();page.get_by_role('button',name='Apri impostazioni').click()
  assert page.locator('#apiKey').input_value()==''
  assert 'chat privata originale' not in page.locator('#messages').inner_text()
  page.locator('#apiKey').fill('gsk_test_senza_accesso_reale')
  page.get_by_role('button',name='Salva impostazioni',exact=True).click()
  page.locator('#textInput').fill('Ciao HEIWA');page.locator('#textInput').press('Enter')
  page.wait_for_function("document.querySelectorAll('.msg.assistant').length===1")
  assert requests and requests[0].headers.get('authorization')=='Bearer gsk_test_senza_accesso_reale'
  assert page.evaluate('window.bad') is None
  assert page.evaluate("localStorage.getItem('heiwa_web_v1_settings').includes('gsk_test')")==False
  assert page.evaluate("sessionStorage.getItem('heiwa_web_v1_key')")=='gsk_test_senza_accesso_reale'
  page.get_by_role('button',name='Memoria',exact=True).click()
  page.locator('#memoryInput').set_input_files({'name':'memoria.json','mimeType':'application/json','buffer':json.dumps([{'role':'user','content':'Preferisco risposte brevi','api_key':'NON_IMPORTARE'},{'role':'system','content':'NON_IMPORTARE_SISTEMA'}]).encode()})
  page.wait_for_function("document.getElementById('memoryText').value.includes('Preferisco')")
  assert 'NON_IMPORTARE' not in page.locator('#memoryText').input_value()
  page.get_by_role('button',name='Salva memoria',exact=True).click()
  page.get_by_role('button',name='Chiudi memoria',exact=True).click()
  page.locator('#textInput').fill('Bozza a\ndue righe');page.locator('#textInput').press('Shift+Enter')
  assert '\n' in page.locator('#textInput').input_value()
  page.locator('#textInput').fill('')
  page.screenshot(path='/workspace/heiwa-phone.png',full_page=True)
  page.on('dialog',lambda dialog:dialog.accept())
  page.locator('#provider').select_option('qwen')
  local=[]
  def qwen(route):
   local.append(route.request);route.fulfill(json={'message':{'content':'Risposta locale simulata'}},headers={'Access-Control-Allow-Origin':'*'})
  page.route('http://127.0.0.1:11434/api/chat',qwen)
  page.locator('#textInput').fill('Domanda locale');page.locator('#send').click()
  page.wait_for_function("document.getElementById('messages').textContent.includes('Risposta locale simulata')")
  assert 'authorization' not in local[0].headers
  payload=json.loads(local[0].post_data)
  assert payload['model']=='qwen3:0.6b' and len(payload['messages'])==2
  assert 'Preferisco risposte brevi' in payload['messages'][0]['content']
  assert not errors,errors
  for width,height in [(412,915),(1280,800),(360,640)]:
   page.set_viewport_size({'width':width,'height':height})
   assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),(width,height)
  page.set_viewport_size({'width':1280,'height':800});page.screenshot(path='/workspace/heiwa-tablet.png',full_page=True)
  browser.close();print('PASS: phone/tablet layout, isolated storage, Groq/Ollama requests, Enter/Shift+Enter, memory import, XSS-safe messages. Providers mocked; no real API key used.')
finally:server.shutdown();server.server_close()
