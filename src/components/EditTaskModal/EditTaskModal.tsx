import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import type { Task } from '../../types/TaskTypes';
import type { User } from '../../types/UserTypes';
import modalStyles from '../../styles/commonModal.module.css';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (taskId: number, data: Partial<Task>) => void;
    task: Task | null;
    possibleAssignees: User[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onSubmit, task, possibleAssignees }) => {
    const [formData, setFormData] = useState<Partial<Task>>({});

    useEffect(() => {
        if (task) {
            setFormData(task);
        }
    }, [task]);

    if (!isOpen || !task) return null;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => Number(option.value));
        setFormData(prev => ({ ...prev, responsibleUserIds: selectedIds }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(task.id, formData);
    };

    return (
        <div className={modalStyles.modalOverlay}>
            <form onSubmit={handleSubmit} className={modalStyles.modalContent}>
                <h3>Editando Tarefa #{task.id}</h3>

                <label className={modalStyles.label}>Descrição:</label>
                <input name="description" value={formData.description || ''} onChange={handleChange} required className={modalStyles.input} />

                <label className={modalStyles.label}>Prazo:</label>
                <input name="dueDate" type="date" value={formData.dueDate || ''} onChange={handleChange} required className={modalStyles.input} />

                <label className={modalStyles.label}>Responsáveis:</label>
                <select multiple value={formData.responsibleUserIds?.map(String) || []} onChange={handleMultiSelectChange} className={modalStyles.input} style={{ minHeight: '120px' }}>
                    {possibleAssignees.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.levelName})</option>
                    ))}
                </select>

                <div className={modalStyles.modalActions}>
                    <button type="button" onClick={onClose}>Cancelar</button>
                    <button type="submit">Salvar Alterações</button>
                </div>
            </form>
        </div>
    );
};