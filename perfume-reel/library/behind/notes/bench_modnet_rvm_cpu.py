import sys,time,numpy as np,onnxruntime as ort
from PIL import Image
B=sys.argv[1]; img=Image.open(B+"/modnet/assets/inputs/img0.jpg").convert("RGB")
print("img",img.size)
so=ort.SessionOptions(); so.intra_op_num_threads=4
# MODNet
s=ort.InferenceSession(B+"/models/modnet_photographic.onnx",so,providers=["CPUExecutionProvider"])
for W,H in [(384,672),(512,896)]:
    x=np.asarray(img.resize((W,H),Image.BILINEAR),np.float32)/255; x=((x-.5)/.5).transpose(2,0,1)[None]
    s.run(None,{s.get_inputs()[0].name:x})
    t=time.time()
    for _ in range(5): m=s.run(None,{s.get_inputs()[0].name:x})[0]
    print("MODNet",W,H,"%.0f ms"%((time.time()-t)/5*1000))
    if W==512: Image.fromarray((m[0,0]*255).astype(np.uint8)).save(sys.argv[2]+"/modnet_alpha.png")
# RVM
r=ort.InferenceSession(B+"/models/rvm_mobilenetv3_fp32.onnx",so,providers=["CPUExecutionProvider"])
print([i.name for i in r.get_inputs()])
for W,H,ds in [(720,1280,0.25),(1080,1920,0.25),(1080,1920,0.375)]:
    x=np.asarray(img.resize((W,H)),np.float32).transpose(2,0,1)[None]/255
    st=[np.zeros((1,1,1,1),np.float32) for _ in range(4)]
    inp=lambda st:{"src":x,"r1i":st[0],"r2i":st[1],"r3i":st[2],"r4i":st[3],"downsample_ratio":np.array([ds],np.float32)}
    o=r.run(None,inp(st)); st=o[2:6]
    t=time.time()
    for _ in range(5): o=r.run(None,inp(st)); st=o[2:6]
    print("RVM",W,H,ds,"%.0f ms"%((time.time()-t)/5*1000))
    if W==1080 and ds==0.375: Image.fromarray((o[1][0,0]*255).astype(np.uint8)).save(sys.argv[2]+"/rvm_alpha.png")
