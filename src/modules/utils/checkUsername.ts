import { User } from "../../entity/User";

const { uniqueNamesGenerator, NumberDictionary, adjectives } = require('unique-names-generator');

export const createSuggestions: any = async (firstName: String) => {
    const numberDictionary = NumberDictionary.generate({ min: 1, max: 99999 });
    const suggestedname = uniqueNamesGenerator({
        dictionaries: [[firstName], adjectives, numberDictionary],
        separator: "_"
    });
    let newname = await User.findOne({ userName: suggestedname })
    if (newname) {
        return createSuggestions(firstName)
    }
    return suggestedname
}