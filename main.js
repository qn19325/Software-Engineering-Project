
var canvas = document.getElementById('renderCanvas');
        var engine = new BABYLON.Engine(canvas, true);

        //Basic scene
        BABYLON.SceneLoader.Load("", "01.master-static-scene.glb", engine, function (scene) {

            //var image = BABYLON.SceneLoader.ImportMeshAsync("", "", "hologram.babylon");

            //default camera
            var camera = new BABYLON.ArcRotateCamera("Camera", -1, 1, 25, new BABYLON.Vector3.Zero(), scene);
            camera.attachControl(canvas, true);
                        
            //some little basics tweaks on the scene
            // scene.ambientColor = new BABYLON.Color3(0.1, 0.11, 0.12);
            // scene.clearColor = new BABYLON.Color3.White();
            //scene.clearColor = new BABYLON.Color3(0.92, 0.90, 0.90);
            
            //adding a dynamic light
            var dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(1, -1, 1), scene);
            dirLight.diffuse = new BABYLON.Color3(1, 1, 0.98);
            dirLight.position = new BABYLON.Vector3(-100, 100, -100);
            
            //Brighter
            var helper = scene.createDefaultEnvironment({
                enableGroundMirror: true,
                groundShadowLevel: 0.6,
            });       

            helper.setMainColor(BABYLON.Color3.Teal());

            //we can now access to our static objects
            var ground = scene.getMeshByName("hologram");
            ground.receiveShadows = true;
            //ground.position.y = -1;
            
            //var monkey = scene.getMeshByName("Suzanne");

            //adding dynamic shadows
            var shadowGenerator = new BABYLON.ShadowGenerator(64, dirLight);
            shadowGenerator.useExponentialShadowMap = true;
            shadowGenerator.setDarkness(0.5);
            //shadowGenerator.addShadowCaster(monkey);
         
            /***lab experimental modules***/
            BABYLON.SceneLoader.ImportMeshAsync("", "", "lab14.babylon").then((result) => {
                // result.mesh[1].position.x= 2;
                // const table = scene.getMeshByName("table");
                // const table = result.meshes[0];
                // table.position.y = 2;

                // result.meshes[0].position.y=2;//table
                // result.meshes[1].position.y=3;//dish
                // result.meshes[2].position.y=0.6;//tubeBox

                const table = result.meshes[0];
                table.name = "table";
                //table.position.y = 2;

                const dish = result.meshes[1];
                dish.name = "dish";
                //dish.position.y = 3;

                const tubeBox = result.meshes[2];
                tubeBox.name = "tubeBox";
                //tubeBox.position.y = 0.6;

                const loop = result.meshes[3];
                loop.name = "loop";

                const microscope = result.meshes[4];
                microscope.name = "microscope";
                //microscope.rotation.x = ;


                /***Interactions-Dragging***/
                var startingPoint;
                var currentObj;

                var getTablePosition = function() {
                    var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function(mesh){ return mesh == table; });
                    if (pickinfo.hit) {
                        return pickinfo.pickedPoint;
                    }
                    return null;
                }

                var pointerDown = function (mesh) {
                    currentObj = mesh;
                    startingPoint = getTablePosition();
                    if (startingPoint) {
                        setTimeout(function () {
                            camera.detachControl(canvas);
                        }, 0);
                    }
               }

                var pointerUp = function () {
                    if (startingPoint) {
                        camera.attachControl(canvas, true);
                        startingPoint = null;
                        return;
                    }
                }
            
                var pointerMove = function () {
                    if (!startingPoint) {
                        return;
                    }
                    var current = getTablePosition();
                    if (!current) {
                        return;
                    }
                
                    var diff = current.subtract(startingPoint);
                    currentObj.position.addInPlace(diff);
                
                    startingPoint = current;
                
                }
            
                scene.onPointerObservable.add((pointerInfo) => {      		
                    switch (pointerInfo.type) {
        	    		case BABYLON.PointerEventTypes.POINTERDOWN:
        	    			if(pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != table) {
                                pointerDown(pointerInfo.pickInfo.pickedMesh)
                            }
        	    			break;
        	    		case BABYLON.PointerEventTypes.POINTERUP:
                                pointerUp();
        	    			break;
        	    		case BABYLON.PointerEventTypes.POINTERMOVE:          
                                pointerMove();
        	    			break;
                    }
                });

                /***Interactions-Displays***/
                var adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("interface", true)

                var mainbox = new BABYLON.GUI.Rectangle();
                mainbox.height = "20%";
                mainbox.width = "10%";
                mainbox.paddingRight = "2px";
                mainbox.cornerRadius = 4;
                mainbox.color = "white";
                mainbox.thickness = 1.5;
                mainbox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                mainbox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                mainbox.background = "transparent";
                adt.addControl(mainbox);
                mainbox.isVisible = false;

                var tubeText = new BABYLON.GUI.TextBlock();
                tubeText.text = "Test tube: holding liquid chemicals";
                tubeText.color = "white";
                tubeText.fontSize = 20;
                tubeText.textWrapping = true;
                //mainbox.addControl(tubeText);

                var dishText = new BABYLON.GUI.TextBlock();
                dishText.text = "Petri dish are filled with agar";
                dishText.color = "white";
                dishText.fontSize = 20;
                dishText.textWrapping = true;
                //mainbox.addControl(dishText);

                var header = new BABYLON.GUI.Rectangle();
                header.height = "50px";
                header.width = "96%";
                header.left = "0%";
                header.cornerRadius = 4;
                header.color = "white";
                header.thickness = 1;
                header.background = "transparent";
                header.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                mainbox.addControl(header);
                
                var headertext = new BABYLON.GUI.TextBlock();
                //headertext.text = "Properties";
                headertext.color = "white";
                headertext.fontSize = 20;
                headertext.textWrapping = true;
                header.addControl(headertext);

                var contentRect = new BABYLON.GUI.Rectangle();
                contentRect.height = "80%";
                contentRect.width = "96%";
                contentRect.top = "7%";
                contentRect.left = "0%";
                contentRect.cornerRadius = 4;
                contentRect.color = "yellow";
                contentRect.thickness = 1;
                mainbox.addControl(contentRect);
                contentRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                
                var overMesh = function(bjsEvent) {
                    console.log(bjsEvent);
                    mainbox.isVisible = true;
                    //mainbox.linkWithMesh(bjsEvent.meshUnderPointer);
                    //mainbox.linkOffsetY = -80;
                    //headertext.text = mainbox.linkedMesh.name + " property"
                    headertext.text = "Property"
                    for(var i =0; i < scene.meshes.length; i++){
                        if(mainbox.linkedMesh.name = "tubeBox") {
                            mainbox.addControl(tubeText);
                        } else if (mainbox.linkedMesh.name = "dish") {
                            mainbox.addControl(dishText);
                        } else if (mainbox.linkedMesh.name = "microscope") {
                            mainbox.addControl(dishText);
                        } else if (mainbox.linkedMesh.name = "loop") {
                            mainbox.addControl(dishText);
                        }
                    }
                }
            
                var exitMesh = function(bjsEvent) {
                    console.log(bjsEvent);
                    mainbox.isVisible = false;
                    mainbox.linkWithMesh(null);
                }
                
                var prepareOverOut = function (mesh) {
    
                    mesh.actionManager = new BABYLON.ActionManager(scene);

                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPointerOverTrigger, overMesh
                        )
                    );

                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPointerOutTrigger, exitMesh
                        )
                    );

                }
                //Hint displays
                prepareOverOut(dish);
                prepareOverOut(tubeBox);
                prepareOverOut(microscope);
                prepareOverOut(loop);
                

                //Hide lables, if it's table, lables show up
                mainStage.actionManager = new BABYLON.ActionManager(scene); 

                mainStage.actionManager.registerAction(
                    new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPickDownTrigger, function() {
                            mainbox.isVisible = false;
                            mainbox.linkWithMesh(null);
                        }
                    )
                );
                
                
                /***GUI1***/
                var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

                var rect1 = new BABYLON.GUI.Rectangle();
                rect1.width = 0.05;
                rect1.height = "40px";
                rect1.cornerRadius = 20;
                rect1.color = "pink";
                rect1.thickness = 2;
                rect1.background = "white";
                advancedTexture.addControl(rect1);
                rect1.linkWithMesh(dish);   
                rect1.linkOffsetY = -150;
                               
                var label = new BABYLON.GUI.TextBlock();
                label.text = "Dish";
                rect1.addControl(label);
                        
                var target = new BABYLON.GUI.Ellipse();
                target.width = "10px";
                target.height = "10px";
                target.color = "pink";
                target.thickness = 2;
                target.background = "white";
                advancedTexture.addControl(target);
                target.linkWithMesh(dish);   
                        
                var line = new BABYLON.GUI.Line();
                line.lineWidth = 4;
                line.color = "pink";
                line.y2 = 20;
                line.linkOffsetY = -5;
                advancedTexture.addControl(line);
                line.linkWithMesh(dish); 
                line.connectedControl = rect1; 

                /***GUI2***/
                var rect2 = new BABYLON.GUI.Rectangle();
                rect2.width = 0.05;
                rect2.height = "40px";
                rect2.cornerRadius = 20;
                rect2.color = "pink";
                rect2.thickness = 2;
                rect2.background = "white";
                advancedTexture.addControl(rect2);
                rect2.linkWithMesh(tubeBox);   
                rect2.linkOffsetY = -150;
                        
                var label2 = new BABYLON.GUI.TextBlock();
                label2.text = "Tubes";
                rect2.addControl(label2);
                        
                var target2 = new BABYLON.GUI.Ellipse();
                target2.width = "10px";
                target2.height = "10px";
                target2.color = "pink";
                target2.thickness = 2;
                target2.background = "white";
                advancedTexture.addControl(target2);
                target2.linkWithMesh(tubeBox);   
                        
                var line2 = new BABYLON.GUI.Line();
                line2.lineWidth = 4;
                line2.color = "pink";
                line2.y2 = 20;
                line2.linkOffsetY = -5;
                advancedTexture.addControl(line2);
                line2.linkWithMesh(tubeBox); 
                line2.connectedControl = rect2; 

        });
            
            // this show the inspector, uncomment to use it
            //scene.debugLayer.show();

            engine.runRenderLoop(function() {
                scene.render();
            });

            window.addEventListener("resize", function () {
                engine.resize();
            });
        });