// src/app/api/generate/route.ts - Complete generation API with queue tracking
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Types
interface AdvancedOptions {
  gender: 'female' | 'male'
  age: number
  bodyType: number
  breastSize: number
  pose: string
  skinTone: number
  wetness: number
  censored?: boolean
}

interface PoseConfig {
  lora: string;
  strength: number;
  prompt: string;
  negativePrompt: string;
  ipadapterWeight: number;
  cfg: number;
  steps: number;
}

interface WorkflowNode {
  inputs: Record<string, unknown>;
  class_type: string;
  _meta: {
    title: string;
  };
}

interface Workflow {
  [key: string]: WorkflowNode;
}

// Configuration
const COMFYUI_SERVER_URL = process.env.COMFYUI_SERVER_URL || 'http://localhost:8188'
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function debugLog(message: string, data?: unknown) {
  console.log(`[API DEBUG] ${message}`, data || '')
}

async function ensureDirectories() {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
      debugLog('Created upload directory:', UPLOAD_DIR)
    }
  } catch (error) {
    debugLog('Error creating directories:', error)
    throw error
  }
}

// Track generation in queue system
async function trackGenerationInQueue(data: {
  promptId: string;
  userId: string;
  deviceId: string;
  pose: string;
  gender: string;
}): Promise<void> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    
    await fetch(`${baseUrl}/api/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(5000)
    });
    
    console.log('📊 Generation tracked in queue:', data.promptId);
  } catch (error) {
    console.warn('⚠️ Failed to track generation in queue:', error);
    // Don't throw - this is non-critical
  }
}

function generatePrompts(options: AdvancedOptions) {
  const { gender, age, bodyType, breastSize, pose, skinTone, wetness } = options

  const poseConfigs: Record<string, PoseConfig> = {
    'selfie': {
      lora: 'Selfie_Slut.safetensors',
      strength: 1.2,
      prompt: 'selfieslut, ((amateur selfie taken by a pretty girl)), (((wearing sexy outfit in her bedroom))), (lingerie), upskirt, solo, revealing, pussy, mirror shot, phone, low resolution, grainy, low quality, from above, bed',
      negativePrompt: '',
      ipadapterWeight: 0.5,
      cfg: 3,
      steps: 10
    },
    'squirting': {
      lora: 'squirting_female ejaculation_SDXL-V1.safetensors',
      strength: 1,
      prompt: 'masterpiece,best quality, (a photo of a Beautiful 18 year old girl masturbating squirting excessive pussy juice from her vagina and woman is squirting excessive pussy juice from her vagina upwards and squirting excessive pussy juice from her pussy over her head and squirting excessive pussy juice from her pussy into the air),(woman pussy juice is squirting onto the camera and wet lens), closed eyes, orgasm,flash photography, squatting,(motion blur:1.3) and (blurred foreground:1.3), ass visible through thighs, arms behind back, <lora:squirting_female ejaculation_SDXL-V1:0.8>',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear, skinny, blurry, low quality, (2_girls), wide shoulders, broad shoulders, masculine, square shoulders',
      ipadapterWeight: 0.5,
      cfg: 2.5,
      steps: 10
    },
    'hand-on-head': {
      lora: 'Hand_on_Head_V2.safetensors',
      strength: 1.2,
      prompt: 'score_9, score_8_up, score_7_up, realistic skin, dynamic light, warm_light, vibrant colors warm_colors, soft focus, high contrast, textured surfaces, depth of field, rich details, (4K image quality:1.3), (sharp detail:1.3), (highly realistic:1.3), (dim warm cinematic lighting:1.1), sweat, open mouth, saliva, getting face fucked,( hairgrabblowjob:1.2), deepthroat, huge penis',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear, skinny, blurry, low quality, (2_girls), wide shoulders, broad shoulders, masculine, square shoulders',
      ipadapterWeight: 1.2,
      cfg: 4,
      steps: 10
    },
    'gagging': {
      lora: 'gag_deepthroat-000009.safetensors',
      strength: 1.3,
      prompt: '<lora:41B5833439:0.7> giving a deep throat blowjob on top sloppy spit on her face snot coming out of her nose, enormous penis, hairgrabblowjob, hand on head, ((cum dripping, drooling, excessive saliva dripping, dripping from mouth, dripping from nose)), blowjob, g4g, g4gging',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear, skinny, blurry, low quality, (2_girls), wide shoulders, broad shoulders, masculine, square shoulders',
      ipadapterWeight: 0.5,
      cfg: 4,
      steps: 10
    },
    'pants-down': {
      lora: 'MS_Real_PantsDown.safetensors',
      strength: 1.2,
      prompt: 'masterpiece, ,(solo:1.1), perfect face, (lingerie), pants, (((panties))), underwear, (bright lighting:1.2),beautiful detailed eyes, extremely detailed face, perfect lighting,masterpiece, best quality, (female), 1girl ,anus,pussy, ass, from behind, clothes pull, pants,underwear, looking back, pants pull, <lora:MS_Real_PantsDown:1>',
      negativePrompt: '',
      ipadapterWeight: 0.5,
      cfg: 3,
      steps: 10
    },
    'standing-front': {
      lora: 'cameltoe.safetensors',
      strength: 0.1,
      prompt: 'standing pose, front view, soft silhouette, boobs',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear, skinny, blurry, low quality, (2_girls), wide shoulders, broad shoulders, masculine, square shoulders',
      ipadapterWeight: 0.5,
      cfg: 2.5,
      steps: 10
    },
    'standing-back': {
      lora: 'rearpussy-xl-1.0.safetensors',
      strength: 1.2,
      prompt: 'Rearviewspread, anus, rear shot, back view, rear view, looking at viewer, innie pussy, cameltoe, ass, rear pussy, (look back:1.2), innie, closeup <lora:rearpussy-xl-1.0:1> , 35mm photograph, bokeh, professional, 4k, highly detailed, girl bedroom, ((fully naked))',
      negativePrompt: 'blurry, distorted,((((wearing clothes)))), (((((clothes))))), underwear, old',
      ipadapterWeight: 0.5,
      cfg: 4.0,
      steps: 10
    },
    'from above': {
      lora: 'ass-from-behind.safetensors',
      strength: 1.4,
      prompt: 'ass, ((on stomach)), ((fully naked)), lying on bed, (from behind), from above, 1girl, solo, pillow, looking at viewer, looking back, <lora:ass-from-behind:0.9>, ((masterpiece, best quality)), highres, legs together, ((((legs closed)))), perfect butt, prone bov, from above',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear,',
      ipadapterWeight: 0.5,
      cfg: 6.0,
      steps: 10
    },
    'laying-legs-open': {
      lora: 'cameltoe.safetensors',
      strength: 0.9,
      prompt: 'laying pose, legs spread, ((fully naked)), lying down, spread legs, cameltoe',
      negativePrompt: 'clothed, dressed, ((((wearing clothes)))), (((((clothes))))), underwear,',
      ipadapterWeight: 0.5,
      cfg: 1.0,
      steps: 10
    },
    'ass-spread': {
      lora: 'MS_Real_XL_Buttlift.safetensors',
      strength: 0.9,
      prompt: 'score_9, score_8_up, score_7_up, ((fully naked)), 1girl, (((from behind))), (((viewer very close to ass))), cute face, sweaty,topless, (((buttlift))), spreading ass cheeks, spreading ass to expose pussy, pussy exposed, wet pussy, puffy pussy, pussy juices dripping down thighs, looking over shoulder, looking at viewer, half closed eyes, petite, hipbones, wide hips, thigh gap',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear,',
      ipadapterWeight: 0.5,
      cfg: 3.0,
      steps: 10
    },
    'doggystyle': {
      lora: 'Doggystyle anal XL.safetensors',
      strength: 1.0,
      prompt: 'having doggystyle anal sex <lora:Doggystyle anal XL:1>, looking to viewer, ((fully naked)), lookingto camera, ((giant penis)), (((enormous penis))), big cock in anus, wet anus, wet pussy, ((anal)), bedroom, bed, couch',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear,',
      ipadapterWeight: 0.5,
      cfg: 3.0,
      steps: 10
    },
    'missionary-pov': {
      lora: 'PovMissionaryAnal-v6.safetensors',
      strength: 1.2,
      prompt: '(masterpiece, best quality, hires, high resolution:1.2), (extremely detailed, realistic, intricate details, highres), a beautiful young woman, nude, perfect teardrop breasts, erect nipples, fit petite body, (ecstasy:1.2), natural skin, missionary anal, ((creampie)), spreading legs, legs up, from above, from front, ((fully naked)), close up, (lying on bed), luxurious grey bedroom, professional decor, HDR, (morning sunlight, cinematic lighting, perfect lighting, bloom), <lora:PovMissionaryAnal-v6:.8>, giant penis, ((very large penis penetrating anus)), happy, anal sex, (((wet pussy))), (wet anus), cum',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear,',
      ipadapterWeight: 0.5,
      cfg: 6.0,
      steps: 10
    },
    'oral-pov': {
      lora: 'POV_Blowjob_On_Top_Between_Legs.safetensors',
      strength: 1.2,
      prompt: 'score_9, score_8_up, score_7_up, Raw Photo, Portrait, ((fully naked)), yorha no. 2 type b, cute, angry, innocent, view from above her, laying down, on her back, sucking dick, ((blowjob, deepthroat)), big eyes, face close-up, dynamic angle, (photo realistic:1.4), realistic skin:1.4, fashion photography, sharp, analog film grain, hyperdetailed:1.15, face closeup',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear,',
      ipadapterWeight: 0.5,
      cfg: 4.0,
      steps: 10
    },
    'cumshot': {
      lora: 'FellatioJapan_Studio_Ripper_POV_Cumshot-000002.safetensors',
      strength: 0.9,
      prompt: 'pov, looking at viewer, blowjob, ((fully naked)), <lora:FellatioJapan_Studio_Ripper_POV_Cumshot-000005:0.8>fjpovcumshot, 1girl, (cum), cumshot, penis on tongue, mouth open, tongue out, thick cum on tongue, ejaculation from penis, (cum on face), black background, <lora:sdxl_lightning_8step_lora:1>',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear,',
      ipadapterWeight: 0.5,
      cfg: 2.5,
      steps: 10
    },
    'tongue-out': {
      lora: 'Awaiting_Cum.safetensors',
      strength: 1,
      prompt: 'score_9, score_8_up, score_7_up, photo, creative angle, POV, wide angle, 1girl, ((fully naked)), live action foto, cute girl, wet and sweaty, detailed face, cute face, petite body, HD32K, incredibly detailed, arched back, (naughty, teasing expression), ((toned, fit, biceps), villa, girl sitting on her knees, looking up, eyes half-closed, eye contact, mouth open, tongue out, waiting for a cumshot, cum in mouth, cum on face, (((cumshotinmouth))), (cum), blowjob, very long penis, (huge penis), cum on tongue, penis on tongue, cum on body',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear,',
      ipadapterWeight: 0.5,
      cfg: 4.5,
      steps: 10
    },
    'blowjob': {
      lora: 'BallsDeepThroat-000009.safetensors',
      strength: 0.7,
      prompt: ' blowjob, (b4llsd33p, holding down), deepthroat, ((fully naked)), facefucking, throat bulge, (retching:1.2), shoulders together, hunched over, drooling saliva, spit bubble, saliva bubble, monster cock, (((huge cock))), massive cock, absurdly large cock, (long cock), female focus, faceless male, looking at you, wide view, full body view, happy, (looking at viewer), face close-up',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear,',
      ipadapterWeight: 0.5,
      cfg: 2.0,
      steps: 10
    },
    'shower': {
      lora: 'Showeringv1.safetensors',
      strength: 1.0,
      prompt: 'in a shower, shower scene, ((fully naked)), wet body, water droplets, bathroom tiles, steam, wet hair, soap suds, sensual pose, looking at viewer, standing in shower, water streaming down body, modern bathroom',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear, dry, clothed',
      ipadapterWeight: 0.5,
      cfg: 3.5,
      steps: 10
    },
    'sucking': {
      lora: 'oral_focus.safetensors',
      strength: 1.1,
      prompt: 'oral sex, sucking, ((fully naked)), mouth open, tongue visible, intimate pose, close-up facial expression, eyes looking up, lips wrapped around, saliva, wet mouth, passionate expression, kneeling position',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear,',
      ipadapterWeight: 0.5,
      cfg: 3.0,
      steps: 10
    },
    // Male poses
    'from behind': {
      lora: 'cameltoe.safetensors',
      strength: 0.5,
      prompt: 'from behind, back view, rear view, standing, male body, muscular',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear, female, woman, girl',
      ipadapterWeight: 0.5,
      cfg: 3.0,
      steps: 10
    },
    'spread legs': {
      lora: 'cameltoe.safetensors',
      strength: 0.5,
      prompt: 'spread legs, sitting, legs apart, male body, muscular',
      negativePrompt: '((((wearing clothes)))), (((((clothes))))), underwear, female, woman, girl',
      ipadapterWeight: 0.5,
      cfg: 3.0,
      steps: 10
    }
  }

  const poseConfig = poseConfigs[pose]

  let positive = `a ${gender === 'female' ? 'girl' : 'man'} naked, perfect face, cute face, nude, naked, 1_${gender === 'female' ? 'girl' : 'person'}`

  if (age >= 18 && age <= 25) {
    positive += ', young adult'
  } else if (age > 25 && age <= 35) {
    positive += ', adult'
  } else if (age > 35) {
    positive += ', mature adult'
  }

  if (bodyType < 30) {
    positive += ', slim, petite'
  } else if (bodyType > 70) {
    positive += ', curvy, voluptuous'
  }

  if (gender === 'female') {
    if (breastSize < 30) {
      positive += ', small breasts'
    } else if (breastSize > 70) {
      positive += ', large breasts'
    }
    positive += ', innie pussy'
  }

  if (skinTone < 30) {
    positive += ', dark skin'
  } else if (skinTone > 70) {
    positive += ', pale skin, light skin'
  }

  if (wetness > 50) {
    positive += ', wet, squirting, ((cum dripping from vagina)), (((cum dripping from anus))), dripping, wet pussy, wet vagina, wet ass, wet anus, creampie, cum, saliva dripping from vagina, cum in anus, cum on pussy, cum dripping from vagina, cum dripping from anus, creampie, squirting from anus, squirting from vagina, peeing, piss '
  } else if (wetness > 20) {
    positive += 'wet vagina, wet ass'
  }

  if (poseConfig && poseConfig.prompt) {
    positive += `, ${poseConfig.prompt}`
  }

  positive += ', masterpiece, best quality, ultra detailed, photorealistic, 8k uhd'

  let negative = `painting, outdoor, big chin, tattoos, pubic hair, 3d, makeup, cgi, illustration, blur, earings, wedding dress, ${gender === 'female' ? '(man)' : '(woman)'}, lowres, text, error, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, 4_persons, curvy, sexy, busty, scarf, collar`

  if (poseConfig && poseConfig.negativePrompt) {
    negative += `, ${poseConfig.negativePrompt}`
  }

  return { positive, negative, poseConfig }
}

async function loadWorkflow(isCensored: boolean = false): Promise<Workflow> {
  try {
    const workflowFile = isCensored ? 'nudeet_workflow_censored.json' : 'nudeet_workflow_base.json'
    const workflowPath = path.join(process.cwd(), workflowFile)
    
    if (!existsSync(workflowPath)) {
      throw new Error(`Workflow file not found: ${workflowPath}`)
    }
    
    const workflowContent = await readFile(workflowPath, 'utf-8')
    return JSON.parse(workflowContent) as Workflow
  } catch (err) {
    throw new Error(`Failed to load workflow: ${err}`)
  }
}

async function uploadImageToComfyUI(imagePath: string, filename: string): Promise<boolean> {
  try {
    const imageBuffer = await readFile(imagePath)
    const formData = new FormData()
    const blob = new Blob([imageBuffer])
    formData.append('image', blob, filename)
    formData.append('overwrite', 'true')
    
    const response = await fetch(`${COMFYUI_SERVER_URL}/upload/image`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000)
    })
    
    if (!response.ok) {
      return false
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  } catch {
    return false
  }
}

async function submitToComfyUI(
  workflow: Workflow, 
  imagePath: string, 
  prompts: { positive: string; negative: string }, 
  poseConfig: PoseConfig | undefined,
  options: AdvancedOptions,
  userId: string,
  deviceId: string
): Promise<string> {
  try {
    const workflowCopy: Workflow = JSON.parse(JSON.stringify(workflow))
    
    if (workflowCopy["320"] && workflowCopy["320"].inputs) {
      workflowCopy["320"].inputs.text = prompts.positive
    }
    
    if (workflowCopy["12"] && workflowCopy["12"].inputs) {
      workflowCopy["12"].inputs.text = prompts.negative
    }

    const imageFilename = path.basename(imagePath)
    const uploadSuccess = await uploadImageToComfyUI(imagePath, imageFilename)
    
    if (!uploadSuccess) {
      throw new Error('Failed to upload image to ComfyUI')
    }

    if (workflowCopy["499"]) {
      workflowCopy["499"] = {
        "inputs": {
          "image": imageFilename
        },
        "class_type": "LoadImage",
        "_meta": {
          "title": "Load Uploaded Image"
        }
      }
    }

    const loraInfo = []
    
    if (poseConfig && workflowCopy["502"] && workflowCopy["502"].inputs) {
      workflowCopy["502"].inputs.lora_name = poseConfig.lora
      workflowCopy["502"].inputs.strength_model = poseConfig.strength
      workflowCopy["502"].inputs.strength_clip = poseConfig.strength
      
      loraInfo.push({
        node: '502',
        name: poseConfig.lora,
        strength: poseConfig.strength,
        type: 'Pose-Specific'
      })
    }

    if (workflowCopy["392"] && workflowCopy["392"].inputs) {
      workflowCopy["392"].inputs.lora_name = "cameltoe.safetensors"
      workflowCopy["392"].inputs.strength_model = 0.2
      workflowCopy["392"].inputs.strength_clip = 0.2
      
      loraInfo.push({
        node: '392',
        name: 'cameltoe.safetensors',
        strength: 0.2,
        type: 'Base'
      })
    }

    if (workflowCopy["328"] && workflowCopy["328"].inputs) {
      workflowCopy["328"].inputs.lora_name = "BallsDeepThroat-000009.safetensors"
      workflowCopy["328"].inputs.lora_weight = 1.0
      
      loraInfo.push({
        node: '328',
        name: 'BallsDeepThroat-000009.safetensors',
        weight: 1.0,
        type: 'Info'
      })
    }

    if (poseConfig && workflowCopy["3"] && workflowCopy["3"].inputs) {
      workflowCopy["3"].inputs.weight = poseConfig.ipadapterWeight
    }

    let samplerInfo = {}
    const seed = Math.floor(Math.random() * 1000000000000000)
    
    if (poseConfig && workflowCopy["14"] && workflowCopy["14"].inputs) {
      workflowCopy["14"].inputs.cfg = poseConfig.cfg
      workflowCopy["14"].inputs.steps = poseConfig.steps
      workflowCopy["14"].inputs.seed = seed
      
      samplerInfo = {
        seed,
        steps: poseConfig.steps,
        cfg: poseConfig.cfg,
        sampler_name: workflowCopy["14"].inputs.sampler_name || 'default'
      }
    } else if (workflowCopy["14"] && workflowCopy["14"].inputs) {
      workflowCopy["14"].inputs.seed = seed
      samplerInfo = { seed, steps: 'default', cfg: 'default' }
    }

    const sessionId = `nudeet_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const saveNodeId = workflowCopy["533"] ? "533" : "524"
    
    if (workflowCopy[saveNodeId] && workflowCopy[saveNodeId].inputs) {
      workflowCopy[saveNodeId].inputs.session_id = sessionId
      workflowCopy[saveNodeId].inputs.user_hash = Math.random().toString(36).substr(2, 16)
    }

    const clientId = `nudeet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log('🎯 =================== GENERATION PARAMETERS ===================')
    console.log('📋 Pose Configuration:', poseConfig ? {
      lora: poseConfig.lora,
      strength: poseConfig.strength,
      cfg: poseConfig.cfg,
      steps: poseConfig.steps,
      ipadapterWeight: poseConfig.ipadapterWeight
    } : 'No pose config')
    console.log('🎨 LoRAs Applied:', loraInfo)
    console.log('⚙️ Sampler Settings:', samplerInfo)
    console.log('👤 User Info:', { userId, deviceId })
    console.log('📝 =================== PROMPTS ===================')
    console.log('✅ Positive Prompt:', prompts.positive)
    console.log('❌ Negative Prompt:', prompts.negative)
    console.log('🎯 =====================================================')
    
    const response = await fetch(`${COMFYUI_SERVER_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: workflowCopy,
        client_id: clientId
      }),
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ComfyUI returned ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.prompt_id) {
      throw new Error('No prompt_id received from ComfyUI')
    }

    // ADDED: Track generation in queue system
    await trackGenerationInQueue({
      promptId: result.prompt_id,
      userId,
      deviceId,
      pose: options.pose,
      gender: options.gender
    });

    return await pollForCompletion(result.prompt_id, saveNodeId)
  } catch (err) {
    throw err
  }
}

async function pollForCompletion(promptId: string, saveNodeId: string): Promise<string> {
  const maxAttempts = 120
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const queueResponse = await fetch(`${COMFYUI_SERVER_URL}/queue`)
      if (queueResponse.ok) {
        const queueData = await queueResponse.json()
        
        const isRunning = (queueData.queue_running as Array<[number, string]>).some((item) => item[1] === promptId)
        const isPending = (queueData.queue_pending as Array<[number, string]>).some((item) => item[1] === promptId)
        
        if (!isRunning && !isPending) {
          const historyResponse = await fetch(`${COMFYUI_SERVER_URL}/history`)
          if (historyResponse.ok) {
            const historyData = await historyResponse.json()
            
            if (historyData[promptId]) {
              const outputs = historyData[promptId].outputs
              
              if (outputs[saveNodeId] && outputs[saveNodeId].images && outputs[saveNodeId].images.length > 0) {
                const imageInfo = outputs[saveNodeId].images[0]
                return `/api/image?filename=${imageInfo.filename}&subfolder=${imageInfo.subfolder || ''}&type=${imageInfo.type || 'output'}`
              }
              
              for (const nodeId in outputs) {
                const nodeOutput = outputs[nodeId]
                if (nodeOutput.images && nodeOutput.images.length > 0) {
                  const imageInfo = nodeOutput.images[0]
                  return `/api/image?filename=${imageInfo.filename}&subfolder=${imageInfo.subfolder || ''}&type=${imageInfo.type || 'output'}`
                }
              }
              
              throw new Error('Generation completed but no output image found')
            }
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000))
      attempts++
    } catch (err) {
      attempts++
      if (attempts >= maxAttempts) {
        throw new Error(`Polling failed after ${maxAttempts} attempts: ${err}`)
      }
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  
  throw new Error(`Generation timeout after ${maxAttempts} attempts`)
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload JPG, PNG, or WebP images only.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 10MB.'
  }
  return null
}

// Extract user info from request headers
function extractUserInfo(request: NextRequest): { userId: string; deviceId: string } {
  // Try to get user info from headers (you can set these in your client)
  const userId = request.headers.get('x-user-id') || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const deviceId = request.headers.get('x-device-id') || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return { userId, deviceId }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureDirectories()
    
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const optionsJson = formData.get('options') as string
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }
    
    if (!optionsJson) {
      return NextResponse.json({ error: 'No options provided' }, { status: 400 })
    }
    
    const validationError = validateFile(imageFile)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }
    
    let options: AdvancedOptions
    try {
      options = JSON.parse(optionsJson) as AdvancedOptions
    } catch {
      return NextResponse.json({ error: 'Invalid options format' }, { status: 400 })
    }
    
    // Extract user info for tracking
    const { userId, deviceId } = extractUserInfo(request)
    
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const fileExtension = path.extname(imageFile.name) || '.jpg'
    const filename = `nudeet_face_${timestamp}_${randomId}${fileExtension}`
    
    const localImagePath = path.join(UPLOAD_DIR, filename)
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    await writeFile(localImagePath, buffer)
    
    try {
      const promptResult = generatePrompts(options)
      const workflow = await loadWorkflow(options.censored)
      const resultImageUrl = await submitToComfyUI(
        workflow, 
        localImagePath, 
        promptResult, 
        promptResult.poseConfig,
        options,
        userId,
        deviceId
      )
      
      try {
        await unlink(localImagePath)
      } catch {
        // File cleanup failed, but continue
      }
      
      console.log('✅ =================== GENERATION SUCCESS ===================')
      console.log('🎉 Result Image URL:', resultImageUrl)
      console.log('⏱️ Total Generation Time:', `${((Date.now() - startTime) / 1000).toFixed(2)}s`)
      console.log('👤 User Info:', { userId, deviceId })
      console.log('✅ ==========================================================')
      
      return NextResponse.json({
        success: true,
        imageUrl: resultImageUrl,
        isCensored: options.censored || false,
        userId,
        deviceId,
        generationTime: ((Date.now() - startTime) / 1000).toFixed(2)
      })
      
    } catch (err) {
      try {
        await unlink(localImagePath)
      } catch {
        // File cleanup failed, but continue
      }
      
      console.error('❌ Generation failed:', err)
      return NextResponse.json({ error: `Generation failed: ${err}` }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'API is running',
    timestamp: new Date().toISOString(),
    comfyuiUrl: COMFYUI_SERVER_URL
  })
}