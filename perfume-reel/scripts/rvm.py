import sys, subprocess, numpy as np, onnxruntime as ort, time
model, src, out = sys.argv[1:4]
W,H = 356,634
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
dec = subprocess.Popen(['ffmpeg','-nostdin','-v','error','-i',src,'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg','-nostdin','-v','error','-y','-f','rawvideo','-pix_fmt','gray','-s',f'{W}x{H}','-r','30','-i','-',
  '-c:v','ffv1','-pix_fmt','gray',out],stdin=subprocess.PIPE)
rec=[np.zeros([1,1,1,1],np.float32)]*4; ds=np.array([1.0],np.float32); n=0; t0=time.time()
while True:
    b=dec.stdout.read(W*H*3)
    if len(b)<W*H*3: break
    x=np.frombuffer(b,np.uint8).reshape(H,W,3).transpose(2,0,1)[None].astype(np.float32)/255
    fgr,pha,*rec=sess.run(None,{'src':x,'r1i':rec[0],'r2i':rec[1],'r3i':rec[2],'r4i':rec[3],'downsample_ratio':ds})
    enc.stdin.write((np.clip(pha[0,0],0,1)*255).astype(np.uint8).tobytes()); n+=1
    if n%200==0: print(n, round(time.time()-t0,1), flush=True)
enc.stdin.close(); enc.wait(); print('done',n)
