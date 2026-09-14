import fs from "node:fs/promises"
import path from "node:path";

const pokemon = process.argv[2];

async function  main() {
    try{
        if(!pokemon){
            throw new Error(`Enter the pokemon name!`);
        }
        const pokemonName = pokemon.trim().toLowerCase();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        
        if(!response.ok){
            if (response.status === 404) {
                throw new Error(`Pokemon "${pokemonName}" not found.`);
            }

            throw new Error(`HTTP error: ${response.status}.`);
        }

        const data = await response.json();

        const pokemonData = {
            name : data.name,
            id: data.id,
            height : data.height,
            weight : data.weight,
            base_experience : data.base_experience,
            types : data.types.map((item) => item.type.name),
            abilities : data.abilities.map((item) => item.ability.name),
            stats : data.stats.map((item) => {
                return {name: item.stat.name,
                        base_stat : item.base_stat
                };
            })
        }
        // making folder
        await fs.mkdir("examples", { recursive: true });

        const content = JSON.stringify(pokemonData,null, 2);
        let fileName = path.join("examples", `${pokemonData.name}.json`);
        let counter = 1;

        while(true){
            try{
                await fs.access(fileName);
                
                fileName = path.join("examples", `${pokemonData.name}(${counter}).json`);
                
                counter++;
            }
            catch(error){
                if(error.code === "ENOENT"){
                    break;
                }
                throw error
            }
        }

        await fs.writeFile(fileName, content,{flag: "wx"});

        console.log(`Pokemon saved to ${fileName}`);
    }
    catch(error){
        console.error("Error:", error.message);
        process.exit(1);
    }
    
}


main();