import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { Contract, Signer, ContractStatus, EventType } from '@prisma/client';
import { apiClient } from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

type UseContractsProps = {
  page?: number;
  limit?: number;
  status?: ContractStatus | 'ALL';
  search?: string;
};

type UseContractsReturn = {
  // State
  contracts: Contract[];
  contract: Contract | null;
  signers: Signer[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  
  // Actions
  createContract: (data: Partial<Contract>) => Promise<Contract | null>;
  updateContract: (id: string, data: Partial<Contract>) => Promise<Contract | null>;
  deleteContract: (id: string) => Promise<boolean>;
  sendContract: (id: string) => Promise<boolean>;
  signContract: (id: string, signatureData: any) => Promise<boolean>;
  declineContract: (id: string, reason?: string) => Promise<boolean>;
  downloadContract: (id: string, type: 'original' | 'signed' = 'original') => Promise<void>;
  refreshContracts: () => Promise<void>;
  
  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setStatus: (status: ContractStatus | 'ALL') => void;
  setSearch: (search: string) => void;
};\n
export function useContracts({
  page: initialPage = 1,
  limit: initialLimit = 10,
  status: initialStatus = 'ALL',
  search: initialSearch = '',
}: UseContractsProps = {}): UseContractsReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [contractStatus, setContractStatus] = useState<ContractStatus | 'ALL'>(initialStatus);
  const [search, setSearch] = useState<string>(initialSearch);
  
  const totalPages = Math.ceil(total / limit);
  
  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(contractStatus !== 'ALL' && { status: contractStatus }),
        ...(search && { search }),
      });
      
      const response = await apiClient.get<{ data: Contract[]; total: number }>(
        `${API_ROUTES.API.CONTRACTS}?${params.toString()}`
      );
      
      setContracts(response.data || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch contracts:', err);
      setError(err.message || 'Failed to load contracts');
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }, [status, page, limit, contractStatus, search]);
  
  // Fetch single contract
  const fetchContract = useCallback(async (id: string) => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<{ data: Contract; signers: Signer[] }>(
        `${API_ROUTES.API.CONTRACTS}/${id}`
      );
      
      setContract(response.data || null);
      setSigners(response.signers || []);
      return response.data;
    } catch (err: any) {
      console.error('Failed to fetch contract:', err);
      setError(err.message || 'Failed to load contract');
      toast.error('Failed to load contract');
      return null;
    } finally {
      setLoading(false);
    }
  }, [status]);
  
  // Create contract
  const createContract = async (data: Partial<Contract>): Promise<Contract | null> => {
    if (status !== 'authenticated') return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<{ data: Contract }>(
        API_ROUTES.API.CONTRACTS,
        data
      );
      
      toast.success('Contract created successfully');
      return response.data || null;
    } catch (err: any) {
      console.error('Failed to create contract:', err);
      setError(err.message || 'Failed to create contract');
      toast.error('Failed to create contract');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Update contract
  const updateContract = async (id: string, data: Partial<Contract>): Promise<Contract | null> => {
    if (status !== 'authenticated') return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.put<{ data: Contract }>(
        `${API_ROUTES.API.CONTRACTS}/${id}`,
        data
      );
      
      // Update the contract in the contracts list
      setContracts(prev => 
        prev.map(c => (c.id === id ? { ...c, ...response.data } : c))
      );
      
      // Update the current contract if it's the one being updated
      if (contract?.id === id) {
        setContract(prev => (prev ? { ...prev, ...response.data } : null));
      }
      
      toast.success('Contract updated successfully');
      return response.data || null;
    } catch (err: any) {
      console.error('Failed to update contract:', err);
      setError(err.message || 'Failed to update contract');
      toast.error('Failed to update contract');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete contract
  const deleteContract = async (id: string): Promise<boolean> => {
    if (status !== 'authenticated') return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.delete(`${API_ROUTES.API.CONTRACTS}/${id}`);
      
      // Remove the contract from the contracts list
      setContracts(prev => prev.filter(c => c.id !== id));
      
      // Clear the current contract if it's the one being deleted
      if (contract?.id === id) {
        setContract(null);
      }
      
      toast.success('Contract deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Failed to delete contract:', err);
      setError(err.message || 'Failed to delete contract');
      toast.error('Failed to delete contract');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Send contract to signers
  const sendContract = async (id: string): Promise<boolean> => {
    if (status !== 'authenticated') return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.post(`${API_ROUTES.API.CONTRACTS}/${id}/send`);
      
      // Update the contract status
      setContracts(prev => 
        prev.map(c => 
          c.id === id ? { ...c, status: 'SENT' as ContractStatus } : c
        )
      );
      
      // Update the current contract if it's the one being sent
      if (contract?.id === id) {
        setContract(prev => 
          prev ? { ...prev, status: 'SENT' as ContractStatus } : null
        );
      }
      
      toast.success('Contract sent to signers');
      return true;
    } catch (err: any) {
      console.error('Failed to send contract:', err);
      setError(err.message || 'Failed to send contract');
      toast.error('Failed to send contract');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign contract
  const signContract = async (id: string, signatureData: any): Promise<boolean> => {
    if (status !== 'authenticated') return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.post(`${API_ROUTES.API.CONTRACTS}/${id}/sign`, signatureData);
      
      // Refresh the contract data
      await fetchContract(id);
      
      toast.success('Contract signed successfully');
      return true;
    } catch (err: any) {
      console.error('Failed to sign contract:', err);
      setError(err.message || 'Failed to sign contract');
      toast.error('Failed to sign contract');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Decline contract
  const declineContract = async (id: string, reason: string = ''): Promise<boolean> => {
    if (status !== 'authenticated') return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.post(`${API_ROUTES.API.CONTRACTS}/${id}/decline`, { reason });
      
      // Update the contract status
      setContracts(prev => 
        prev.map(c => 
          c.id === id ? { ...c, status: 'DECLINED' as ContractStatus } : c
        )
      );
      
      // Update the current contract if it's the one being declined
      if (contract?.id === id) {
        setContract(prev => 
          prev ? { ...prev, status: 'DECLINED' as ContractStatus } : null
        );
      }
      
      toast.success('Contract declined');
      return true;
    } catch (err: any) {
      console.error('Failed to decline contract:', err);
      setError(err.message || 'Failed to decline contract');
      toast.error('Failed to decline contract');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Download contract
  const downloadContract = async (id: string, type: 'original' | 'signed' = 'original'): Promise<void> => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_ROUTES.API.CONTRACTS}/${id}/download?type=${type}`;
      const filename = type === 'original' ? 'contract.pdf' : 'signed-contract.pdf';
      
      await apiClient.download(url, filename);
    } catch (err: any) {
      console.error('Failed to download contract:', err);
      setError(err.message || 'Failed to download contract');
      toast.error('Failed to download contract');
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh contracts list
  const refreshContracts = async (): Promise<void> => {
    await fetchContracts();
  };
  
  // Load contracts when component mounts or dependencies change
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);
  
  // Load single contract when ID changes
  useEffect(() => {
    const { id } = router.query;
    if (id && typeof id === 'string') {
      fetchContract(id);
    } else {
      setContract(null);
      setSigners([]);
    }
  }, [router.query, fetchContract]);
  
  return {
    // State
    contracts,
    contract,
    signers,
    loading,
    error,
    total,
    totalPages,
    
    // Actions
    createContract,
    updateContract,
    deleteContract,
    sendContract,
    signContract,
    declineContract,
    downloadContract,
    refreshContracts,
    
    // Pagination
    setPage,
    setLimit,
    setStatus: setContractStatus,
    setSearch,
  };
}
