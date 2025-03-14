
import { UploadIcon } from "lucide-react";
import { useCanvas } from "./CanvasContext";
import { importPSDFile } from "./utils/psd/importPSD";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";

export const PSDImport = () => {
  const { selectedSize, setElements } = useCanvas();
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handlePSDUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store file name for display
    setFileName(file.name);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.psd')) {
      toast.error("Por favor, carregue um arquivo PSD válido.");
      setFileName(null);
      return;
    }

    try {
      // Set importing state
      setIsImporting(true);
      
      // Show loading toast
      const loadingToast = toast.loading(`Importando ${file.name}... Este processo pode levar alguns segundos.`);
      
      // Log file information
      console.log("=== PSD IMPORT STARTED ===");
      console.log("Importando arquivo PSD:", file.name, "Tamanho:", Math.round(file.size / 1024), "KB");
      
      // Import PSD file
      const elements = await importPSDFile(file, selectedSize);
      
      // Update canvas elements
      setElements(elements);
      
      // Close loading toast
      toast.dismiss(loadingToast);
      
      // Log information about imported elements
      const textElements = elements.filter(el => el.type === 'text').length;
      const imageElements = elements.filter(el => el.type === 'image').length;
      const containerElements = elements.filter(el => el.type === 'container').length;
      
      console.log("=== PSD IMPORT COMPLETED ===");
      console.log("Resumo da importação:", {
        total: elements.length,
        textos: textElements,
        imagens: imageElements,
        containers: containerElements
      });
      
      if (elements.length === 0) {
        toast.warning("Nenhum elemento foi importado do arquivo PSD. Verifique os logs para mais detalhes.");
      } else {
        toast.success(`Importados ${elements.length} elementos do arquivo PSD. (${textElements} textos, ${imageElements} imagens, ${containerElements} containers)`);
      }
    } catch (error) {
      console.error("=== PSD IMPORT ERROR ===");
      console.error("Erro ao importar arquivo PSD:", error);
      toast.error("Falha ao importar arquivo PSD. Verifique o console para detalhes.");
    } finally {
      // Reset importing state
      setIsImporting(false);
      
      // Reset the input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        id="psd-upload"
        accept=".psd"
        onChange={handlePSDUpload}
        className="hidden"
        disabled={isImporting}
      />
      <label htmlFor="psd-upload" className="flex gap-2 items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          asChild
          disabled={isImporting}
        >
          <span>
            <UploadIcon size={14} />
            {isImporting ? "Importando..." : "Importar PSD"}
          </span>
        </Button>
        
        {fileName && !isImporting && (
          <span className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] ml-1">
            {fileName}
          </span>
        )}
      </label>
    </div>
  );
};
