import React, {useRef, useState} from "react";

// Интерфейсы

export enum ParamTypes {
    String = "string",
    Number = "number",
    CheckBox = "checkbox",
    Selector = "select",
}

interface ParamType {
    fieldType: ParamTypes;
    defaultValue?: string;
    values?: string[];
}

interface Param {
    id: number;
    name: string;
    type: ParamType;
}

interface Color {
    id: number;
    hexCode: string;
}

interface ParamValue {
    paramId: number;
    value: string;
}

interface Model {
    paramValues: ParamValue[];
    colors: Color[];
}

interface Props {
    params: Param[];
    model: Model;
}

type TParamsContext = {
    params: Param[];
    model: Model | null;
    setParams: (params: Param[]) => void;
    setModel: (model: Model) => void;
    outputModel: Model | null;
    setOutputModel: (model: Model) => void;
}

// Интерфейсы

// Моковые данные 

const MOCK_PARAMS = [
    {
        "id": 1,
        "name": "Назначение",
        "type": {
            "fieldType": ParamTypes.String,
        }
    },
    {
        "id": 2,
        "name": "Длина",
        "type": {
            "fieldType": ParamTypes.String,
        }
    },
    {
        "id": 3,
        "name": "Высота",
        "type": {
            "fieldType": ParamTypes.Number,
        }
    },
    {
        "id": 4,
        "name": "Тип",
        "type": {
            "fieldType": ParamTypes.Selector,
            "values": [
                "Маленький",
                "Средний",
                "Большой"
            ]
        }
    }
];

const MOCK_MODEL = {
    paramValues: [
        {
            paramId: 1,
            value: "повседневное"
        },
        {
            paramId: 2,
            value: "макси"
        },
        {
            paramId: 4,
            value: "Средний"
        },
        {
            paramId: 3,
            value: "20"
        }
    ],
    colors: []
};

// Моковые данные

// Контекст

const ParamsContext = React.createContext<TParamsContext | null>(null);
const ParamsContextProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [params, setParams] = useState<Param[]>([]);
    const [model, setModel] = useState<Model | null>(null);
    const [outputModel, setOutputModel] = useState<Model | null>(null);

    return <ParamsContext.Provider value={{
        params,
        setParams,
        model,
        setModel,
        outputModel,
        setOutputModel
    }}>
        {children}
    </ParamsContext.Provider>
}

// Контекст

const ParamField = ({
    param: {
        id,
        name,
        type: {
            fieldType,
            defaultValue = "",
            values = []
        },
    }
}: {param: Param}) => {    
    const getFormField = () => {
        switch (fieldType) {
            case ParamTypes.String:
            default:
                return <input 
                    type="text"
                    name={id.toString()}
                    defaultValue={defaultValue}
                />
            case ParamTypes.Number:
                return <input
                    type="number"
                    name={id.toString()}
                    defaultValue={Number(defaultValue)}
                    step={1}
                />
            case ParamTypes.CheckBox:
                return <input
                    type="checkbox"
                    name={id.toString()}
                    defaultChecked={Boolean(defaultValue)}
                />
            case ParamTypes.Selector:
                return <select
                    name={id.toString()}
                    defaultValue={defaultValue}
                >
                    {values.map((value, index) => (
                        <option 
                            key={index} 
                            value={value}
                        >
                            {value}
                        </option>
                    ))}
                </select>
        }
    }

    return (
        <label className="param-field-container">
            {name}
            {getFormField()}
        </label>
    )
   
}

const InputDataFields = () => {

    const [paramsError, setParamsError] = useState("");
    const [modelsError, setModelsError] = useState("");
    const paramsArea = useRef<HTMLTextAreaElement>(null);
    const modelArea = useRef<HTMLTextAreaElement>(null);

    const {
        setModel, 
        setParams,
    } = React.useContext(ParamsContext) as TParamsContext;

    function handleConvertButtonClick() {        
        if(!paramsArea.current) return;
        if(!modelArea.current) return;

        try {
            setParamsError("");
            const params = JSON.parse(paramsArea.current.value ?? "");            
            setParams(params);
        } catch (error) {
            console.error(error);            
            setParamsError("Ошибка преобразования JSON, проверьте правильность написания");
            return;
        }
        try {
            setModelsError("");
            const model = JSON.parse(modelArea.current.value ?? "");            
            setModel(model)
        } catch (error) {
            console.error(error);            
            setModelsError("Ошибка преобразования JSON, проверьте правильность написания");
            return;
        }
        
    }

    return <div className="input-data-wrapper">
        <div>
            <p>Введите params</p>
            <textarea 
                ref={paramsArea}
                placeholder="в формате json" 
                defaultValue={JSON.stringify(MOCK_PARAMS)}
            />
            <p style={{color: "red"}}>{paramsError}</p>
        </div>
        <div>
            <p>Введите model</p>
            <textarea 
                ref={modelArea}
                placeholder="в формате json" 
                defaultValue={JSON.stringify(MOCK_MODEL)}
            />
            <p style={{color: "red"}}>{modelsError}</p>
        </div>
        <button onClick={handleConvertButtonClick}>
            Конвертировать в поля
        </button>
    </div>
}

const ParamForm = ({
    params,
    model: {
        paramValues
    }
}: Props) => {
    const {
        setOutputModel
    } = React.useContext(ParamsContext) as TParamsContext;

    function handleFieldsEditClick(formData: FormData) {
        const newModel: Model = {
            paramValues: [],
            colors: []
        }

        paramValues.map(param => {
            const newValue = formData.get(param.paramId.toString());

            newModel.paramValues.push({
                paramId: param.paramId,
                value: newValue?.toString() ?? param.value
            });
        });

        setOutputModel(newModel);
    }

    return <form className="param-form-container" action={handleFieldsEditClick}>
        {paramValues.map(param => {
            const curParam = params.find(item => item.id === param.paramId);

            if (!curParam) return <></>

            return <ParamField
                key={curParam.id}
                param={{
                    ...curParam,
                    type: {
                        ...curParam.type,
                        defaultValue: param.value
                    }
                }}
            />
        })}
        {paramValues.length > 0 && 
            <button type="submit">
                Редактировать значения полей
            </button>
        }
    </form>
}

const OutputModelArea = () => {
    const {
        outputModel
    } = React.useContext(ParamsContext) as TParamsContext;

    return <div>
        <p>Новая model</p>
        <textarea value={JSON.stringify(outputModel?.paramValues)}></textarea>
    </div>
}

export const ParamEditorPage = () => {
    return <ParamsContextProvider>
        <ParamEditor />
    </ParamsContextProvider>
}

const ParamEditor = () => {
    const {
        model, 
        params,
        outputModel
    } = React.useContext(ParamsContext) as TParamsContext;

    return <div className="param-editor-container">
        <InputDataFields />
        {model !== null 
            ? <ParamForm 
                params={params} 
                model={model} 
            />
            : <p>
                Заполните поля params и models для начала работы
            </p>
        }
        {outputModel && 
            <OutputModelArea />
        }
    </div>
}